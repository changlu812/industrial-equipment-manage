const express = require("express");
const cors = require("cors");
const pool = require("./db");

const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());

app.get("/api/equipment", async (req, res) => {
  const { keyword, status } = req.query;
  const values = [];
  let whereClauses = [];
  if (keyword) {
    values.push(`%${keyword}%`);
    values.push(`%${keyword}%`);
    values.push(`%${keyword}%`);
    whereClauses.push(
      "(e.equipment_id LIKE ? OR e.model LIKE ? OR w.workshop_name LIKE ?)",
    );
  }
  if (status) {
    values.push(status);
    whereClauses.push("e.status = ?");
  }
  const whereSql = whereClauses.length
    ? "WHERE " + whereClauses.join(" AND ")
    : "";
  const sql = `
    SELECT
      e.equipment_id,
      e.model,
      e.factory_date,
      e.purchase_price,
      e.status,
      e.owner AS person_in_charge,
      e.workshop_id,
      w.workshop_name
    FROM equipment_4600 e
    LEFT JOIN workshop_4600 w ON e.workshop_id = w.workshop_id
    ${whereSql}
    ORDER BY e.equipment_id
  `;
  try {
    const [rows] = await pool.execute(sql, values);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/workshops", async (req, res) => {
  const sql = `
    SELECT
      workshop_id,
      workshop_name,
      manager
    FROM workshop_4600
    ORDER BY workshop_id
  `;
  try {
    const [rows] = await pool.execute(sql);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/workshops", async (req, res) => {
  const { workshop_id, workshop_name, manager } = req.body;
  const sql = `
    INSERT INTO workshop_4600 (workshop_id, workshop_name, manager)
    VALUES (?,?,?)
  `;
  const values = [workshop_id, workshop_name, manager];
  try {
    const [result] = await pool.execute(sql, values);
    res.status(201).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/equipment", async (req, res) => {
  const {
    equipment_id,
    model,
    factory_date,
    purchase_price,
    workshop_id,
    person_in_charge,
    status,
  } = req.body;

  // 验证必填字段
  if (!equipment_id || !model) {
    return res.status(400).json({ error: "设备编号和型号为必填项" });
  }

  // 验证设备编号不能重复
  const checkExistSql = `
    SELECT 1 FROM equipment_4600 WHERE equipment_id = ?
  `;
  try {
    const [existing] = await pool.execute(checkExistSql, [equipment_id]);
    if (existing.length) {
      return res.status(400).json({ error: "设备编号已存在" });
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }

  // 如果指定了车间，验证车间存在
  if (workshop_id) {
    const checkSql = `
      SELECT 1 FROM workshop_4600 WHERE workshop_id = ?
    `;
    try {
      const [ws] = await pool.execute(checkSql, [workshop_id]);
      if (!ws.length) {
        return res.status(400).json({ error: "所属车间不存在，请先新增车间" });
      }
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  const sql = `
    INSERT INTO equipment_4600 (
      equipment_id, model, factory_date, purchase_price,
      workshop_id, owner, status
    )
    VALUES (?,?,?,?,?,?,?)
  `;
  const values = [
    equipment_id,
    model,
    factory_date || null,
    purchase_price || null,
    workshop_id || null,
    person_in_charge || null,
    status || "在用",
  ];
  try {
    const [result] = await pool.execute(sql, values);
    res.status(201).json({ id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/equipment/:id", async (req, res) => {
  const id = req.params.id;
  const {
    model,
    factory_date,
    purchase_price,
    workshop_id,
    person_in_charge,
    status,
  } = req.body;
  const sql = `
    UPDATE equipment_4600
    SET
      model = COALESCE(?, model),
      factory_date = COALESCE(?, factory_date),
      purchase_price = COALESCE(?, purchase_price),
      workshop_id = COALESCE(?, workshop_id),
      owner = COALESCE(?, owner),
      status = COALESCE(?, status)
    WHERE equipment_id = ?
  `;
  const values = [
    model || null,
    factory_date || null,
    purchase_price || null,
    workshop_id || null,
    person_in_charge || null,
    status || null,
    id,
  ];
  try {
    const [result] = await pool.execute(sql, values);
    if (result.affectedRows === 0) {
      res.status(404).json({ error: "not found" });
      return;
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/equipment/:id", async (req, res) => {
  const id = req.params.id;
  const checkSql =
    "SELECT 1 FROM maintenance_4600 WHERE equipment_id = ? LIMIT 1";
  const deleteSql = "DELETE FROM equipment_4600 WHERE equipment_id = ?";
  try {
    const [checkRows] = await pool.execute(checkSql, [id]);
    if (checkRows.length) {
      res.status(400).json({ error: "设备已有维修记录，无法删除" });
      return;
    }
    const [result] = await pool.execute(deleteSql, [id]);
    if (result.affectedRows === 0) {
      res.status(404).json({ error: "not found" });
      return;
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/equipment/:id/maintenance", async (req, res) => {
  const id = req.params.id;
  const sql = `
    SELECT
      m.maintenance_id,
      m.repair_time AS maintenance_time,
      m.fault_type,
      m.fault_desc,
      m.repair_cost AS maintenance_cost,
      e.workshop_id
    FROM maintenance_4600 m
    LEFT JOIN equipment_4600 e ON m.equipment_id = e.equipment_id
    WHERE m.equipment_id = ?
    ORDER BY m.repair_time DESC
  `;
  try {
    const [rows] = await pool.execute(sql, [id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/stats/workshops", async (req, res) => {
  const sql = `
    SELECT
      w.workshop_id,
      w.workshop_name,
      COUNT(DISTINCT e.equipment_id) AS equipment_total,
      SUM(CASE WHEN e.status = '在用' THEN 1 ELSE 0 END) AS equipment_in_use,
      COUNT(m.maintenance_id) AS maintenance_times
    FROM workshop_4600 w
    LEFT JOIN equipment_4600 e ON e.workshop_id = w.workshop_id
    LEFT JOIN maintenance_4600 m ON m.equipment_id = e.equipment_id
    GROUP BY w.workshop_id, w.workshop_name
    ORDER BY w.workshop_id
  `;
  try {
    const [rows] = await pool.execute(sql);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/maintenance/trend/equipment/:id", async (req, res) => {
  const id = req.params.id;
  const sql = `
    SELECT
      DATE_FORMAT(m.repair_time, '%Y-%m-01') AS month,
      COUNT(*) AS maintenance_count
    FROM maintenance_4600 m
    WHERE m.equipment_id = ?
    GROUP BY DATE_FORMAT(m.repair_time, '%Y-%m-01')
    ORDER BY month
  `;
  try {
    const [rows] = await pool.execute(sql, [id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/maintenance/trend/workshop/:id", async (req, res) => {
  const id = req.params.id;
  const sql = `
    SELECT
      DATE_FORMAT(m.repair_time, '%Y-%m-01') AS month,
      COUNT(*) AS maintenance_count
    FROM maintenance_4600 m
    JOIN equipment_4600 e ON m.equipment_id = e.equipment_id
    WHERE e.workshop_id = ?
    GROUP BY DATE_FORMAT(m.repair_time, '%Y-%m-01')
    ORDER BY month
  `;
  try {
    const [rows] = await pool.execute(sql, [id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/maintenance/search", async (req, res) => {
  const { start, end, faultType } = req.query;
  const values = [];
  let whereClauses = [];
  if (start) {
    values.push(start);
    whereClauses.push("DATE(m.repair_time) >= ?");
  }
  if (end) {
    values.push(end);
    whereClauses.push("DATE(m.repair_time) <= ?");
  }
  if (faultType) {
    values.push(faultType);
    whereClauses.push("m.fault_type = ?");
  }
  const whereSql = whereClauses.length
    ? "WHERE " + whereClauses.join(" AND ")
    : "";
  const sql = `
    SELECT
      m.maintenance_id,
      m.equipment_id,
      m.repair_time AS maintenance_time,
      m.fault_type,
      m.fault_desc,
      m.repair_cost AS maintenance_cost,
      e.workshop_id
    FROM maintenance_4600 m
    LEFT JOIN equipment_4600 e ON m.equipment_id = e.equipment_id
    ${whereSql}
    ORDER BY m.repair_time DESC
  `;
  try {
    const [rows] = await pool.execute(sql, values);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/maintenance", async (req, res) => {
  const {
    equipment_id,
    maintenance_time,
    fault_type,
    fault_desc,
    maintenance_cost,
    workshop_id,
  } = req.body;
  const generatedId = "M" + Date.now().toString();
  const sql = `
    INSERT INTO maintenance_4600 (
      maintenance_id,
      equipment_id,
      repair_time,
      fault_type,
      fault_desc,
      repair_cost
    )
    VALUES (?,?,?,?,?,?)
  `;
  const values = [
    generatedId,
    equipment_id,
    maintenance_time,
    fault_type,
    fault_desc || null,
    maintenance_cost,
  ];
  try {
    const [result] = await pool.execute(sql, values);
    res.status(201).json({ id: generatedId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const port = process.env.PORT || 3001;

app.listen(port, () => {
  console.log(`backend listening on port ${port}`);
});

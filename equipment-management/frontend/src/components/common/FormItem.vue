<template>
  <div class="form-item" :class="{ required: isRequired, error: hasError }">
    <label v-if="label" class="form-label">
      {{ label }}
      <span v-if="isRequired" class="required-mark">*</span>
    </label>
    <div class="form-control">
      <slot>
        <input
          v-if="type === 'input'"
          v-model="modelValue"
          :type="inputType"
          :placeholder="placeholder"
          :disabled="disabled"
          @blur="handleBlur"
          @keyup.enter="handleEnter"
        />
        <select
          v-else-if="type === 'select'"
          v-model="modelValue"
          :disabled="disabled"
          @blur="handleBlur"
        >
          <option v-if="placeholder" value="" disabled>{{ placeholder }}</option>
          <option
            v-for="option in options"
            :key="option.value"
            :value="option.value"
          >
            {{ option.label }}
          </option>
        </select>
        <textarea
          v-else-if="type === 'textarea'"
          v-model="modelValue"
          :placeholder="placeholder"
          :disabled="disabled"
          :rows="rows"
          @blur="handleBlur"
        />
        <input
          v-else-if="type === 'date'"
          v-model="modelValue"
          type="date"
          :disabled="disabled"
          @blur="handleBlur"
        />
        <input
          v-else-if="type === 'number'"
          v-model.number="modelValue"
          type="number"
          :placeholder="placeholder"
          :disabled="disabled"
          :min="min"
          :max="max"
          :step="step"
          @blur="handleBlur"
          @keyup.enter="handleEnter"
        />
      </slot>
    </div>
    <div v-if="hasError" class="error-message">{{ errorMessage }}</div>
    <div v-else-if="hint" class="hint-message">{{ hint }}</div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: [String, Number, Date, null],
    default: '',
  },
  label: {
    type: String,
    default: '',
  },
  type: {
    type: String,
    default: 'input',
    validator: (value) => ['input', 'select', 'textarea', 'date', 'number'].includes(value),
  },
  inputType: {
    type: String,
    default: 'text',
  },
  placeholder: {
    type: String,
    default: '',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  required: {
    type: Boolean,
    default: false,
  },
  options: {
    type: Array,
    default: () => [],
  },
  rows: {
    type: Number,
    default: 3,
  },
  min: {
    type: Number,
    default: undefined,
  },
  max: {
    type: Number,
    default: undefined,
  },
  step: {
    type: Number,
    default: undefined,
  },
  error: {
    type: String,
    default: '',
  },
  hint: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['update:modelValue', 'blur', 'enter'])

const modelValue = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const isRequired = computed(() => props.required)
const hasError = computed(() => !!props.error)
const errorMessage = computed(() => props.error)

const handleBlur = () => {
  emit('blur')
}

const handleEnter = () => {
  emit('enter')
}
</script>

<style scoped>
.form-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-weight: 500;
  color: var(--text-primary, #262626);
  font-size: 14px;
}

.required-mark {
  color: var(--danger, #ff4d4f);
  margin-left: 4px;
}

.form-control input,
.form-control select,
.form-control textarea {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid var(--border-color, #d9d9d9);
  border-radius: 4px;
  font-size: 14px;
  transition: all 0.3s;
  background: white;
}

.form-control input:focus,
.form-control select:focus,
.form-control textarea:focus {
  outline: none;
  border-color: var(--primary, #1890ff);
  box-shadow: 0 0 0 3px rgba(24, 144, 255, 0.1);
}

.form-control input:disabled,
.form-control select:disabled,
.form-control textarea:disabled {
  background: var(--disabled-bg, #f5f5f5);
  cursor: not-allowed;
}

.form-item.error .form-control input,
.form-item.error .form-control select,
.form-item.error .form-control textarea {
  border-color: var(--danger, #ff4d4f);
}

.form-item.error .form-control input:focus,
.form-item.error .form-control select:focus,
.form-item.error .form-control textarea:focus {
  box-shadow: 0 0 0 3px rgba(255, 77, 79, 0.1);
}

.error-message {
  font-size: 12px;
  color: var(--danger, #ff4d4f);
}

.hint-message {
  font-size: 12px;
  color: var(--text-secondary, #8c8c8c);
}
</style>

"use client"

import { useState } from "react"

/**
 * Custom hook for form handling
 * @param {Object} initialValues - Initial form values
 * @returns {Array} - [formValues, handleChange, resetForm]
 */
const useForm = (initialValues = {}) => {
  const [values, setValues] = useState(initialValues)

  const handleChange = (e) => {
    const { name, value, type } = e.target

    // Handle different input types appropriately
    const processedValue = type === "number" ? (value === "" ? "" : Number.parseFloat(value)) : value

    setValues({
      ...values,
      [name]: processedValue,
    })
  }

  const resetForm = () => {
    setValues(initialValues)
  }

  return [values, handleChange, resetForm]
}

export default useForm;
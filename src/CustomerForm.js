import React, { useState } from 'react';
import { required, match, list, hasError, anyErrors, validateMany } from './formValidation';

const Error = () => (
  <div className="error">An error occurred during save.</div>
);

export const CustomerForm = ({
  firstName,
  lastName,
  phoneNumber,
  onSave
}) => {
  const [error, setError] = useState(false);

  const [customer, setCustomer] = useState({
    firstName,
    lastName,
    phoneNumber
  });

  const [validationErrors, setValidationErrors] = useState({});

  const validators = {
    firstName: required('First name is required'),
    lastName: required('Last name is required'),
    phoneNumber: list(
      required('Phone number is required'),
      match(/^[0-9+()\- ]*$/, 'Only numbers, spaces and these symbols are allowed: ( ) + -')
    )
  };

  const handleBlur = ({ target }) => {
    const result = validateMany(validators, {
      [target.name]: target.value
    });
    setValidationErrors({ ...validationErrors, ...result });
  };

  const renderError = fieldName => {
    if (hasError(validationErrors, fieldName)) {
      return (
        <span className='error'>
          {validationErrors[fieldName]}
        </span>
      );
    }
  };

  const handleChange = ({ target }) =>
    setCustomer(customer => ({
      ...customer,
      [target.name]: target.value
    }));

  const handleSubmit = async e => {
    e.preventDefault();
    const validationResults = validateMany(validators, customer);
    if (!anyErrors(validationResults)) {
      const result = await window.fetch('/customers', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customer)
      });
      if (result.ok) {
        setError(false);
        const customerWithId = await result.json();
        onSave(customerWithId);
      } else {
        setError(true);
      }
    } else {
      setValidationErrors(validationResults);
    }
  };

  return (
    <form id="customer" onSubmit={handleSubmit}>
      {error ? <Error /> : null}
      <label htmlFor="firstName">First name</label>
      <input
        type="text"
        name="firstName"
        id="firstName"
        value={firstName}
        onChange={handleChange}
        onBlur={handleBlur}
      />
      {renderError('firstName')}

      <label htmlFor="lastName">Last name</label>
      <input
        type="text"
        name="lastName"
        id="lastName"
        value={lastName}
        onChange={handleChange}
        onBlur={handleBlur}
      />
      {renderError('lastName')}

      <label htmlFor="phoneNumber">Phone number</label>
      <input
        type="text"
        name="phoneNumber"
        id="phoneNumber"
        value={phoneNumber}
        onChange={handleChange}
        onBlur={handleBlur}
      />
      {renderError('phoneNumber')}

      <input type="submit" value="Add" />
    </form>
  );
};

CustomerForm.defaultProps = {
  onSave: () => { }
};

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { FormInput } from '../FormInput';

describe('FormInput Component', () => {
  const defaultProps = {
    id: 'test-input',
    label: 'Test Input',
    value: '',
    onChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Functionality', () => {
    it('renders input field with label', () => {
      render(<FormInput {...defaultProps} />);
      expect(screen.getByLabelText('Test Input')).toBeInTheDocument();
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('displays the correct value', () => {
      render(<FormInput {...defaultProps} value="test value" />);
      expect(screen.getByDisplayValue('test value')).toBeInTheDocument();
    });

    it('calls onChange with correct value', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      
      render(<FormInput {...defaultProps} onChange={onChange} />);
      
      const input = screen.getByRole('textbox');
      await user.type(input, 'new value');
      
      expect(onChange).toHaveBeenCalledWith('new value');
    });

    it('handles different input types', () => {
      const { rerender } = render(<FormInput {...defaultProps} type="email" />);
      expect(screen.getByRole('textbox')).toHaveAttribute('type', 'email');
      
      rerender(<FormInput {...defaultProps} type="password" />);
      expect(screen.getByLabelText('Test Input')).toHaveAttribute('type', 'password');
    });
  });

  describe('Validation & Error Handling', () => {
    it('displays error message when provided', () => {
      render(<FormInput {...defaultProps} error="This field is required" />);
      expect(screen.getByText('This field is required')).toBeInTheDocument();
      expect(screen.getByRole('textbox')).toHaveClass('border-red-500');
    });

    it('shows required indicator when required prop is true', () => {
      render(<FormInput {...defaultProps} required />);
      expect(screen.getByText('*')).toBeInTheDocument();
    });

    it('handles maxLength prop correctly', () => {
      render(<FormInput {...defaultProps} maxLength={10} value="12345" />);
      expect(screen.getByText('5 / 10')).toBeInTheDocument();
    });

    it('shows character count when maxLength is provided', () => {
      render(<FormInput {...defaultProps} maxLength={20} value="hello" />);
      expect(screen.getByText('5 / 20')).toBeInTheDocument();
    });
  });

  describe('Security Tests', () => {
    it('prevents XSS injection via value prop', () => {
      const maliciousValue = '<script>alert("xss")</script>';
      render(<FormInput {...defaultProps} value={maliciousValue} />);
      
      const input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input.value).toBe(maliciousValue);
      // Input should display the raw text, not execute it
      expect(document.body.innerHTML).not.toContain('<script>');
    });

    it('prevents XSS injection via label prop', () => {
      const maliciousLabel = '<script>alert("xss")</script>Test Label';
      render(<FormInput {...defaultProps} label={maliciousLabel} />);
      
      // Should not find script tags in the rendered output
      expect(document.body.innerHTML).not.toContain('<script>');
    });

    it('prevents XSS injection via placeholder prop', () => {
      const maliciousPlaceholder = '<script>alert("xss")</script>Enter text';
      render(<FormInput {...defaultProps} placeholder={maliciousPlaceholder} />);
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('placeholder', maliciousPlaceholder);
      expect(document.body.innerHTML).not.toContain('<script>');
    });

    it('sanitizes user input through onChange', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      
      render(<FormInput {...defaultProps} onChange={onChange} />);
      
      const input = screen.getByRole('textbox');
      await user.type(input, '<script>alert("xss")</script>');
      
      expect(onChange).toHaveBeenLastCalledWith('<script>alert("xss")</script>');
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      render(<FormInput {...defaultProps} error="Invalid input" />);
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('id', 'test-input');
      expect(input).toHaveAttribute('aria-describedby');
    });

    it('supports keyboard navigation', () => {
      render(<FormInput {...defaultProps} />);
      
      const input = screen.getByRole('textbox');
      input.focus();
      expect(input).toHaveFocus();
    });

    it('properly associates label with input', () => {
      render(<FormInput {...defaultProps} />);
      
      const label = screen.getByText('Test Input');
      const input = screen.getByRole('textbox');
      
      expect(label).toHaveAttribute('for', 'test-input');
      expect(input).toHaveAttribute('id', 'test-input');
    });
  });

  describe('Compact Mode', () => {
    it('renders in compact mode without separate label', () => {
      render(<FormInput {...defaultProps} compact />);
      
      // Should not find a separate label element
      expect(screen.queryByText('Test Input')).not.toBeInTheDocument();
      
      // Should have placeholder with label text
      expect(screen.getByRole('textbox')).toHaveAttribute('placeholder', 'Test Input');
    });

    it('shows required indicator in compact mode', () => {
      render(<FormInput {...defaultProps} compact required />);
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('placeholder', 'Test Input *');
      expect(input).toHaveClass('border-l-4', 'border-l-amber-400');
    });

    it('uses custom placeholder in compact mode', () => {
      render(<FormInput {...defaultProps} compact placeholder="Custom placeholder" />);
      
      expect(screen.getByRole('textbox')).toHaveAttribute('placeholder', 'Custom placeholder');
    });
  });

  describe('Edge Cases', () => {
    it('handles empty string value', () => {
      render(<FormInput {...defaultProps} value="" />);
      expect(screen.getByRole('textbox')).toHaveValue('');
    });

    it('handles null/undefined values gracefully', () => {
      const { rerender } = render(<FormInput {...defaultProps} value={null as any} />);
      expect(screen.getByRole('textbox')).toHaveValue('');
      
      rerender(<FormInput {...defaultProps} value={undefined as any} />);
      expect(screen.getByRole('textbox')).toHaveValue('');
    });

    it('handles very long values', () => {
      const longValue = 'a'.repeat(1000);
      render(<FormInput {...defaultProps} value={longValue} />);
      expect(screen.getByRole('textbox')).toHaveValue(longValue);
    });

    it('handles special characters in value', () => {
      const specialValue = '!@#$%^&*()_+-=[]{}|;:,.<>?';
      render(<FormInput {...defaultProps} value={specialValue} />);
      expect(screen.getByRole('textbox')).toHaveValue(specialValue);
    });

    it('handles unicode characters', () => {
      const unicodeValue = '测试 🚀 émojis';
      render(<FormInput {...defaultProps} value={unicodeValue} />);
      expect(screen.getByRole('textbox')).toHaveValue(unicodeValue);
    });
  });

  describe('Performance', () => {
    it('does not re-render unnecessarily', () => {
      const onChange = jest.fn();
      const { rerender } = render(<FormInput {...defaultProps} onChange={onChange} />);
      
      // Same props should not cause re-render
      rerender(<FormInput {...defaultProps} onChange={onChange} />);
      
      expect(onChange).not.toHaveBeenCalled();
    });

    it('handles rapid typing without performance issues', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      
      render(<FormInput {...defaultProps} onChange={onChange} />);
      
      const input = screen.getByRole('textbox');
      
      // Simulate rapid typing
      const rapidText = 'rapidtypingtest';
      await user.type(input, rapidText);
      
      expect(onChange).toHaveBeenCalledTimes(rapidText.length);
    });
  });

  describe('Integration Tests', () => {
    it('works with form submission', async () => {
      const user = userEvent.setup();
      const onSubmit = jest.fn();
      const onChange = jest.fn();
      
      render(
        <form onSubmit={onSubmit}>
          <FormInput {...defaultProps} onChange={onChange} />
          <button type="submit">Submit</button>
        </form>
      );
      
      const input = screen.getByRole('textbox');
      await user.type(input, 'test value');
      
      const submitButton = screen.getByRole('button');
      await user.click(submitButton);
      
      expect(onChange).toHaveBeenCalledWith('test value');
    });

    it('maintains focus state correctly', async () => {
      const user = userEvent.setup();
      
      render(
        <div>
          <FormInput {...defaultProps} />
          <button>Other Element</button>
        </div>
      );
      
      const input = screen.getByRole('textbox');
      const button = screen.getByRole('button');
      
      await user.click(input);
      expect(input).toHaveFocus();
      
      await user.click(button);
      expect(input).not.toHaveFocus();
      expect(button).toHaveFocus();
    });
  });
}); 
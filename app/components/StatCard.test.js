// /app/components/StatCard.test.js

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import StatCard from './stat-card';

describe('<StatCard />', () => {
  it('should render label, value, description, and suffix', () => {
    const props = {
      label: 'Test Label',
      value: 1234.56,
      color: 'blue',
      description: 'Test Description',
      subtext: 'Test Subtext',
      suffix: '%',
      span: 'lg:col-span-1'
    };
    render(<StatCard {...props} />);
    expect(screen.getByText('Test Label')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
    expect(screen.getByText('Test Subtext')).toBeInTheDocument();
    const valueElement = screen.getByTestId('stat-card-value');
    expect(valueElement).toHaveTextContent('$1,234.56%');
  });

  it('should render without subtext or suffix if not provided', () => {
     const props = {
      label: 'No Sub/Suffix',
      value: 500,
      color: 'green',
      description: 'Desc only',
      span: 'lg:col-span-1'
    };
    render(<StatCard {...props} />);
    expect(screen.getByText('No Sub/Suffix')).toBeInTheDocument();
    expect(screen.getByText('Desc only')).toBeInTheDocument();
    expect(screen.queryByText('Test Subtext')).not.toBeInTheDocument();
    const valueElement = screen.getByTestId('stat-card-value');
    expect(valueElement).toHaveTextContent('$500');
  });

  it('should apply the correct color class based on the color prop', () => {
    const props = {
      label: 'Color Test',
      value: 100,
      color: 'red',
      description: 'Desc',
      span: ''
    };
    render(<StatCard {...props} />);
    const valueElement = screen.getByTestId('stat-card-value');
    expect(valueElement).toHaveTextContent('$100');
    expect(valueElement).toHaveClass('text-danger-primary');
    expect(valueElement).not.toHaveClass('text-blue-500');
  });

   it('should handle null or undefined value gracefully', () => {
     const props = {
      label: 'Null Value',
      value: null,
      color: 'blue',
      description: 'Desc',
      span: ''
    };
    render(<StatCard {...props} />);
    expect(screen.getByText('Null Value')).toBeInTheDocument();
    const valueElement = screen.getByTestId('stat-card-value');
    expect(valueElement.textContent.trim()).toBe('');
   });

   it('should handle zero value correctly', () => {
     const props = {
      label: 'Zero Value',
      value: 0,
      color: 'blue',
      description: 'Desc',
      span: ''
    };
    render(<StatCard {...props} />);
    const valueElement = screen.getByTestId('stat-card-value');
    expect(valueElement).toHaveTextContent('$0');
  });

});

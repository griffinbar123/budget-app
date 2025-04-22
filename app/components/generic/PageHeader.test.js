// /app/components/generic/PageHeader.test.js

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom'; 
import PageHeader from './page-header'; 

describe('<PageHeader />', () => {
  it('should render the title and subtitle correctly', () => {
    const titleText = 'Test Title';
    const subtitleText = 'Test Subtitle';

    render(<PageHeader title={titleText} subtitle={subtitleText} />);

    const titleElement = screen.getByRole('heading', { name: titleText, level: 1 });
    expect(titleElement).toBeInTheDocument();

    const subtitleElement = screen.getByText(subtitleText);
    expect(subtitleElement).toBeInTheDocument();
  });

  it('should render only the title if subtitle is not provided', () => {
    const titleText = 'Only Title';
    render(<PageHeader title={titleText} />);

    const titleElement = screen.getByRole('heading', { name: titleText, level: 1 });
    expect(titleElement).toBeInTheDocument();

    const headerElement = titleElement.parentElement; 
    const paragraphElement = headerElement.querySelector('p');
    // Check if the p tag for subtitle is empty or not present
    expect(paragraphElement).toBeEmptyDOMElement(); 
  });
});

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import DashboardHome from './DashboardHome';
import * as apiUtils from '../utils/api';

vi.mock('../utils/api', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    getFromStorage: vi.fn(),
    saveToStorage: vi.fn(),
  };
});

const mockHistory = [
  { id: '1', fileName: 'contract1.pdf', fileType: 'PDF', fileSize: 1024, uploadDate: '2025-01-01', status: 'Analyzed' },
  { id: '2', fileName: 'agreement2.docx', fileType: 'DOCX', fileSize: 2048, uploadDate: '2025-01-02', status: 'Failed' },
];

describe('DashboardHome', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = () => {
    return render(
      <BrowserRouter>
        <DashboardHome />
      </BrowserRouter>
    );
  };

  it('renders loading state initially if data is not immediately available', () => {
    apiUtils.getFromStorage.mockReturnValue(null);
    renderComponent();
    expect(screen.getByText('No documents yet')).toBeInTheDocument();
  });

  it('renders history from localStorage', () => {
    apiUtils.getFromStorage.mockReturnValue(mockHistory);
    renderComponent();
    expect(screen.getByText('contract1.pdf')).toBeInTheDocument();
    expect(screen.getByText('agreement2.docx')).toBeInTheDocument();
  });

  it('filters documents by search query', () => {
    apiUtils.getFromStorage.mockReturnValue(mockHistory);
    renderComponent();
    
    const searchInput = screen.getByLabelText('Search documents');
    fireEvent.change(searchInput, { target: { value: 'contract1' } });
    
    expect(screen.getByText('contract1.pdf')).toBeInTheDocument();
    expect(screen.queryByText('agreement2.docx')).not.toBeInTheDocument();
  });

  it('filters documents by type', () => {
    apiUtils.getFromStorage.mockReturnValue(mockHistory);
    renderComponent();
    
    const typeFilter = screen.getByLabelText('Filter by file type');
    fireEvent.change(typeFilter, { target: { value: 'DOCX' } });
    
    expect(screen.queryByText('contract1.pdf')).not.toBeInTheDocument();
    expect(screen.getByText('agreement2.docx')).toBeInTheDocument();
  });
});

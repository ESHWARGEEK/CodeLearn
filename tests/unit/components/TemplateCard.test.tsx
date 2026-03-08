import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import TemplateCard from '@/components/developer/TemplateCard';
import { Template } from '@/types/templates';

// Mock Next.js Link component
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

const mockTemplate: Template = {
  id: 'template-1',
  name: 'Authentication Component',
  description: 'A complete authentication system with login, signup, and password reset functionality',
  technology: 'react',
  category: 'authentication',
  rating: 4.5,
  downloads: 1250,
  sourceRepo: 'https://github.com/example/auth-component',
  codeS3Key: 'templates/template-1/code.zip',
  createdBy: 'user-123',
  createdAt: 1709251200,
  updatedAt: 1709337600,
};

describe('TemplateCard', () => {
  it('renders template information correctly', () => {
    render(<TemplateCard template={mockTemplate} />);

    // Check template name
    expect(screen.getByText('Authentication Component')).toBeInTheDocument();

    // Check description
    expect(screen.getByText(/A complete authentication system/)).toBeInTheDocument();

    // Check technology (it's displayed with a bullet point)
    expect(screen.getByText(/• react/)).toBeInTheDocument();

    // Check category (it's displayed in lowercase, not uppercase)
    expect(screen.getByText('authentication')).toBeInTheDocument();

    // Check rating
    expect(screen.getByText('4.5')).toBeInTheDocument();

    // Check download count (formatted)
    expect(screen.getByText('1.3k')).toBeInTheDocument();

    // Check source repo link
    const sourceLink = screen.getByRole('link', { name: /source/i });
    expect(sourceLink).toHaveAttribute('href', 'https://github.com/example/auth-component');
    expect(sourceLink).toHaveAttribute('target', '_blank');
  });

  it('displays correct technology icon', () => {
    render(<TemplateCard template={mockTemplate} />);
    
    // React should show ⚛️ icon
    expect(screen.getByText('⚛️')).toBeInTheDocument();
  });

  it('displays correct category color', () => {
    render(<TemplateCard template={mockTemplate} />);
    
    const categoryBadge = screen.getByText('authentication');
    expect(categoryBadge).toHaveClass('bg-red-500/20', 'text-red-300');
  });

  it('renders star rating correctly', () => {
    render(<TemplateCard template={mockTemplate} />);
    
    // Should have 4 full stars and 1 half star for rating 4.5
    const fullStars = screen.getAllByText('★');
    const halfStars = screen.getAllByText('☆');
    
    expect(fullStars).toHaveLength(4);
    expect(halfStars).toHaveLength(1); // 1 half star (the empty stars are not rendered)
  });

  it('formats download count correctly', () => {
    const templateWithHighDownloads: Template = {
      ...mockTemplate,
      downloads: 15000,
    };

    render(<TemplateCard template={templateWithHighDownloads} />);
    expect(screen.getByText('15.0k')).toBeInTheDocument();
  });

  it('calls onPreview when preview button is clicked', () => {
    const onPreview = vi.fn();
    render(<TemplateCard template={mockTemplate} onPreview={onPreview} />);

    const previewButton = screen.getByRole('button', { name: /preview/i });
    fireEvent.click(previewButton);

    expect(onPreview).toHaveBeenCalledWith('template-1');
  });

  it('calls onIntegrate when integrate button is clicked', () => {
    const onIntegrate = vi.fn();
    render(<TemplateCard template={mockTemplate} onIntegrate={onIntegrate} />);

    const integrateButton = screen.getByRole('button', { name: /integrate/i });
    fireEvent.click(integrateButton);

    expect(onIntegrate).toHaveBeenCalledWith('template-1');
  });

  it('handles missing technology icon gracefully', () => {
    const templateWithUnknownTech: Template = {
      ...mockTemplate,
      technology: 'unknown-tech',
    };

    render(<TemplateCard template={templateWithUnknownTech} />);
    expect(screen.getByText('📦')).toBeInTheDocument();
  });

  it('handles missing category color gracefully', () => {
    const templateWithUnknownCategory: Template = {
      ...mockTemplate,
      category: 'unknown-category',
    };

    render(<TemplateCard template={templateWithUnknownCategory} />);
    
    const categoryBadge = screen.getByText('unknown category');
    expect(categoryBadge).toHaveClass('bg-gray-500/20', 'text-gray-300');
  });

  it('displays hover effects correctly', () => {
    render(<TemplateCard template={mockTemplate} />);
    
    const card = screen.getByText('Authentication Component').closest('.group');
    expect(card).toHaveClass('hover:border-gray-500');
    
    const title = screen.getByText('Authentication Component');
    expect(title).toHaveClass('group-hover:text-indigo-400');
  });

  it('truncates long descriptions', () => {
    const templateWithLongDescription: Template = {
      ...mockTemplate,
      description: 'This is a very long description that should be truncated when displayed in the template card to prevent layout issues and maintain consistent card heights across the grid',
    };

    render(<TemplateCard template={templateWithLongDescription} />);
    
    const description = screen.getByText(/This is a very long description/);
    expect(description).toHaveClass('line-clamp-2');
  });

  it('handles zero rating correctly', () => {
    const templateWithZeroRating: Template = {
      ...mockTemplate,
      rating: 0,
    };

    render(<TemplateCard template={templateWithZeroRating} />);
    
    // Should show 5 empty stars
    const emptyStars = screen.getAllByText('☆');
    expect(emptyStars).toHaveLength(5);
    expect(screen.getByText('0.0')).toBeInTheDocument();
  });

  it('handles perfect rating correctly', () => {
    const templateWithPerfectRating: Template = {
      ...mockTemplate,
      rating: 5,
    };

    render(<TemplateCard template={templateWithPerfectRating} />);
    
    // Should show 5 full stars
    const fullStars = screen.getAllByText('★');
    expect(fullStars).toHaveLength(5);
    expect(screen.getByText('5.0')).toBeInTheDocument();
  });
});
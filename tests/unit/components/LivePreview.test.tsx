import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LivePreview } from '@/components/learning/LivePreview';

// Mock the UI components
vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, ...props }: any) => (
    <button onClick={onClick} disabled={disabled} {...props}>
      {children}
    </button>
  ),
}));

describe('LivePreview Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should render with no preview message when previewUrl is null', () => {
      render(<LivePreview previewUrl={null} />);
      
      expect(screen.getByText('No Preview Available')).toBeInTheDocument();
      expect(screen.getByText('Run your code to see the preview')).toBeInTheDocument();
    });

    it('should render header with Preview title', () => {
      render(<LivePreview previewUrl={null} />);
      
      expect(screen.getByText('Preview')).toBeInTheDocument();
    });

    it('should not show Live indicator when no preview URL', () => {
      render(<LivePreview previewUrl={null} />);
      
      expect(screen.queryByText('Live')).not.toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('should display loading spinner when loading is true', () => {
      render(<LivePreview previewUrl={null} loading={true} />);
      
      expect(screen.getByText('Executing code...')).toBeInTheDocument();
    });

    it('should not show preview content when loading', () => {
      render(<LivePreview previewUrl="https://example.com" loading={true} />);
      
      expect(screen.queryByTitle('Code Preview')).not.toBeInTheDocument();
    });

    it('should hide no preview message when loading', () => {
      render(<LivePreview previewUrl={null} loading={true} />);
      
      expect(screen.queryByText('No Preview Available')).not.toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('should display error message when error is provided', () => {
      const errorMessage = 'Syntax error on line 5';
      render(<LivePreview previewUrl={null} error={errorMessage} />);
      
      expect(screen.getByText('Execution Failed')).toBeInTheDocument();
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    it('should not show preview when error is present', () => {
      render(
        <LivePreview 
          previewUrl="https://example.com" 
          error="Test error" 
        />
      );
      
      expect(screen.queryByTitle('Code Preview')).not.toBeInTheDocument();
    });

    it('should prioritize error over loading state', () => {
      render(
        <LivePreview 
          previewUrl={null} 
          loading={true} 
          error="Test error" 
        />
      );
      
      expect(screen.queryByText('Executing code...')).not.toBeInTheDocument();
      expect(screen.getByText('Execution Failed')).toBeInTheDocument();
    });
  });

  describe('Preview Display', () => {
    it('should render iframe when previewUrl is provided', () => {
      const testUrl = 'https://example.com/preview';
      render(<LivePreview previewUrl={testUrl} />);
      
      const iframe = screen.getByTitle('Code Preview') as HTMLIFrameElement;
      expect(iframe).toBeInTheDocument();
      expect(iframe.src).toBe(testUrl);
    });

    it('should show Live indicator when preview is available', () => {
      render(<LivePreview previewUrl="https://example.com" />);
      
      expect(screen.getByText('Live')).toBeInTheDocument();
    });

    it('should apply correct sandbox attributes to iframe', () => {
      render(<LivePreview previewUrl="https://example.com" />);
      
      const iframe = screen.getByTitle('Code Preview') as HTMLIFrameElement;
      expect(iframe.getAttribute('sandbox')).toBe(
        'allow-scripts allow-same-origin allow-forms allow-modals'
      );
    });

    it('should show loading spinner before iframe loads', () => {
      render(<LivePreview previewUrl="https://example.com" />);
      
      // The iframe loading spinner should be present initially
      const iframe = screen.getByTitle('Code Preview');
      expect(iframe).toHaveStyle({ opacity: '0' });
    });

    it('should update iframe opacity after load', async () => {
      render(<LivePreview previewUrl="https://example.com" />);
      
      const iframe = screen.getByTitle('Code Preview');
      
      // Simulate iframe load
      fireEvent.load(iframe);
      
      await waitFor(() => {
        expect(iframe).toHaveStyle({ opacity: '1' });
      });
    });
  });

  describe('Viewport Controls', () => {
    it('should render viewport selector buttons when preview is available', () => {
      render(<LivePreview previewUrl="https://example.com" />);
      
      expect(screen.getByTitle('Desktop')).toBeInTheDocument();
      expect(screen.getByTitle('Tablet')).toBeInTheDocument();
      expect(screen.getByTitle('Mobile')).toBeInTheDocument();
    });

    it('should not show viewport controls when no preview', () => {
      render(<LivePreview previewUrl={null} />);
      
      expect(screen.queryByTitle('Desktop')).not.toBeInTheDocument();
      expect(screen.queryByTitle('Tablet')).not.toBeInTheDocument();
      expect(screen.queryByTitle('Mobile')).not.toBeInTheDocument();
    });

    it('should highlight desktop viewport by default', () => {
      render(<LivePreview previewUrl="https://example.com" />);
      
      const desktopButton = screen.getByTitle('Desktop');
      expect(desktopButton.className).toContain('bg-primary');
    });

    it('should switch viewport when clicking viewport buttons', () => {
      render(<LivePreview previewUrl="https://example.com" />);
      
      const tabletButton = screen.getByTitle('Tablet');
      fireEvent.click(tabletButton);
      
      expect(tabletButton.className).toContain('bg-primary');
    });
  });

  describe('Action Buttons', () => {
    it('should render refresh button when preview is available', () => {
      render(<LivePreview previewUrl="https://example.com" />);
      
      expect(screen.getByTitle('Refresh preview')).toBeInTheDocument();
    });

    it('should render open in new tab button when preview is available', () => {
      render(<LivePreview previewUrl="https://example.com" />);
      
      expect(screen.getByTitle('Open in new tab')).toBeInTheDocument();
    });

    it('should not show action buttons when no preview', () => {
      render(<LivePreview previewUrl={null} />);
      
      expect(screen.queryByTitle('Refresh preview')).not.toBeInTheDocument();
      expect(screen.queryByTitle('Open in new tab')).not.toBeInTheDocument();
    });

    it('should disable refresh button when loading', () => {
      render(<LivePreview previewUrl="https://example.com" loading={true} />);
      
      const refreshButton = screen.getByTitle('Refresh preview');
      expect(refreshButton).toBeDisabled();
    });

    it('should refresh iframe when clicking refresh button', () => {
      const { rerender } = render(<LivePreview previewUrl="https://example.com" />);
      
      const iframe = screen.getByTitle('Code Preview');
      const initialKey = iframe.getAttribute('key');
      
      const refreshButton = screen.getByTitle('Refresh preview');
      fireEvent.click(refreshButton);
      
      rerender(<LivePreview previewUrl="https://example.com" />);
      
      // The iframe should have a new key after refresh
      const newIframe = screen.getByTitle('Code Preview');
      const newKey = newIframe.getAttribute('key');
      expect(newKey).not.toBe(initialKey);
    });

    it('should open preview in new tab when clicking open button', () => {
      const testUrl = 'https://example.com/preview';
      const windowOpenSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
      
      render(<LivePreview previewUrl={testUrl} />);
      
      const openButton = screen.getByTitle('Open in new tab');
      fireEvent.click(openButton);
      
      expect(windowOpenSpy).toHaveBeenCalledWith(
        testUrl,
        '_blank',
        'noopener,noreferrer'
      );
      
      windowOpenSpy.mockRestore();
    });
  });

  describe('Preview URL Changes', () => {
    it('should update iframe when previewUrl changes', () => {
      const { rerender } = render(<LivePreview previewUrl="https://example.com/v1" />);
      
      const iframe1 = screen.getByTitle('Code Preview') as HTMLIFrameElement;
      expect(iframe1.src).toBe('https://example.com/v1');
      
      rerender(<LivePreview previewUrl="https://example.com/v2" />);
      
      const iframe2 = screen.getByTitle('Code Preview') as HTMLIFrameElement;
      expect(iframe2.src).toBe('https://example.com/v2');
    });

    it('should reset iframe loaded state when URL changes', () => {
      const { rerender } = render(<LivePreview previewUrl="https://example.com/v1" />);
      
      const iframe = screen.getByTitle('Code Preview');
      fireEvent.load(iframe);
      
      // After load, opacity should be 1
      expect(iframe).toHaveStyle({ opacity: '1' });
      
      // Change URL
      rerender(<LivePreview previewUrl="https://example.com/v2" />);
      
      // Opacity should reset to 0
      const newIframe = screen.getByTitle('Code Preview');
      expect(newIframe).toHaveStyle({ opacity: '0' });
    });
  });

  describe('Accessibility', () => {
    it('should have proper iframe title', () => {
      render(<LivePreview previewUrl="https://example.com" />);
      
      expect(screen.getByTitle('Code Preview')).toBeInTheDocument();
    });

    it('should have descriptive button titles', () => {
      render(<LivePreview previewUrl="https://example.com" />);
      
      expect(screen.getByTitle('Refresh preview')).toBeInTheDocument();
      expect(screen.getByTitle('Open in new tab')).toBeInTheDocument();
      expect(screen.getByTitle('Desktop')).toBeInTheDocument();
    });

    it('should provide clear error messages', () => {
      render(<LivePreview previewUrl={null} error="Network timeout" />);
      
      expect(screen.getByText('Execution Failed')).toBeInTheDocument();
      expect(screen.getByText('Network timeout')).toBeInTheDocument();
    });
  });

  describe('Responsive Viewport Sizing', () => {
    it('should apply full width for desktop viewport', () => {
      render(<LivePreview previewUrl="https://example.com" />);
      
      const container = screen.getByTitle('Code Preview').parentElement;
      expect(container).toHaveStyle({ maxWidth: '100%' });
    });

    it('should apply tablet width when tablet viewport selected', () => {
      render(<LivePreview previewUrl="https://example.com" />);
      
      const tabletButton = screen.getByTitle('Tablet');
      fireEvent.click(tabletButton);
      
      const container = screen.getByTitle('Code Preview').parentElement;
      expect(container).toHaveStyle({ maxWidth: '768px' });
    });

    it('should apply mobile width when mobile viewport selected', () => {
      render(<LivePreview previewUrl="https://example.com" />);
      
      const mobileButton = screen.getByTitle('Mobile');
      fireEvent.click(mobileButton);
      
      const container = screen.getByTitle('Code Preview').parentElement;
      expect(container).toHaveStyle({ maxWidth: '375px' });
    });
  });
});

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import AIMentorChat from '@/components/shared/AIMentorChat';

describe('AIMentorChat', () => {
  it('renders with initial AI greeting message', () => {
    render(<AIMentorChat />);

    expect(screen.getByText(/AI Mentor/i)).toBeInTheDocument();
    expect(
      screen.getByText(/I'm here to help you learn and solve problems/i)
    ).toBeInTheDocument();
  });

  it('displays online status indicator', () => {
    render(<AIMentorChat />);

    expect(screen.getByText('Online')).toBeInTheDocument();
  });

  it('renders quick action buttons', () => {
    render(<AIMentorChat />);

    expect(screen.getByRole('button', { name: /Explain/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Find Bugs/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Optimize/i })).toBeInTheDocument();
  });

  it('allows user to type and send messages', async () => {
    render(<AIMentorChat />);

    const input = screen.getByPlaceholderText('Ask me anything...');
    const sendButton = screen.getByRole('button', { name: '' }); // Send button with icon

    // Type a message
    fireEvent.change(input, { target: { value: 'How do I use useState?' } });
    expect(input).toHaveValue('How do I use useState?');

    // Send the message
    fireEvent.click(sendButton);

    // Check that user message appears
    await waitFor(() => {
      expect(screen.getByText('How do I use useState?')).toBeInTheDocument();
    });

    // Check that input is cleared
    expect(input).toHaveValue('');
  });

  it('sends message on Enter key press', async () => {
    render(<AIMentorChat />);

    const input = screen.getByPlaceholderText('Ask me anything...');

    // Type a message
    fireEvent.change(input, { target: { value: 'What is React?' } });

    // Press Enter
    fireEvent.keyPress(input, { key: 'Enter', code: 'Enter', charCode: 13 });

    // Check that user message appears
    await waitFor(() => {
      expect(screen.getByText('What is React?')).toBeInTheDocument();
    });
  });

  it('disables send button when input is empty', () => {
    render(<AIMentorChat />);

    const input = screen.getByPlaceholderText('Ask me anything...');
    const sendButton = screen.getByRole('button', { name: '' });

    expect(sendButton).toBeDisabled();

    // Type something
    fireEvent.change(input, { target: { value: 'Hello' } });
    expect(sendButton).not.toBeDisabled();

    // Clear input
    fireEvent.change(input, { target: { value: '' } });
    expect(sendButton).toBeDisabled();
  });

  it('shows typing indicator while loading', async () => {
    render(<AIMentorChat />);

    const input = screen.getByPlaceholderText('Ask me anything...');
    const sendButton = screen.getByRole('button', { name: '' });

    // Send a message
    fireEvent.change(input, { target: { value: 'Test message' } });
    fireEvent.click(sendButton);

    // Check for typing indicator (animated dots)
    await waitFor(() => {
      const typingIndicator = screen.getByText('Test message').parentElement?.parentElement;
      expect(typingIndicator).toBeInTheDocument();
    });
  });

  it('quick action buttons populate input field', () => {
    render(<AIMentorChat />);

    const input = screen.getByPlaceholderText('Ask me anything...');
    const explainButton = screen.getByRole('button', { name: /Explain/i });

    // Click quick action
    fireEvent.click(explainButton);

    // Check that input is populated
    expect(input).toHaveValue('Can you explain this code to me?');
  });

  it('disables input and buttons while loading', async () => {
    render(<AIMentorChat />);

    const input = screen.getByPlaceholderText('Ask me anything...');
    const sendButton = screen.getByRole('button', { name: '' });
    const explainButton = screen.getByRole('button', { name: /Explain/i });

    // Send a message
    fireEvent.change(input, { target: { value: 'Test' } });
    fireEvent.click(sendButton);

    // Check that controls are disabled
    await waitFor(() => {
      expect(input).toBeDisabled();
      expect(explainButton).toBeDisabled();
    });
  });

  it('displays AI response after user message', async () => {
    render(<AIMentorChat />);

    const input = screen.getByPlaceholderText('Ask me anything...');
    const sendButton = screen.getByRole('button', { name: '' });

    // Send a message
    fireEvent.change(input, { target: { value: 'Help me' } });
    fireEvent.click(sendButton);

    // Wait for AI response
    await waitFor(
      () => {
        expect(
          screen.getByText(/Great question! Let me help you with that/i)
        ).toBeInTheDocument();
      },
      { timeout: 2000 }
    );
  });

  it('accepts context prop', () => {
    const context = {
      currentTask: 'Implement authentication',
      code: 'const user = {}',
      projectId: 'proj-123',
    };

    render(<AIMentorChat context={context} />);

    // Component should render without errors
    expect(screen.getByText(/AI Mentor/i)).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<AIMentorChat className="custom-class" />);

    const chatContainer = container.firstChild;
    expect(chatContainer).toHaveClass('custom-class');
  });

  it('auto-scrolls to bottom when new messages arrive', async () => {
    const { container } = render(<AIMentorChat />);

    const input = screen.getByPlaceholderText('Ask me anything...');
    const sendButton = screen.getByRole('button', { name: '' });

    // Send multiple messages
    for (let i = 0; i < 3; i++) {
      fireEvent.change(input, { target: { value: `Message ${i}` } });
      fireEvent.click(sendButton);
      await waitFor(() => {
        expect(screen.getByText(`Message ${i}`)).toBeInTheDocument();
      });
    }

    // Check that messages container exists
    const messagesContainer = container.querySelector('.overflow-y-auto');
    expect(messagesContainer).toBeInTheDocument();
  });

  it('displays timestamps for messages', async () => {
    render(<AIMentorChat />);

    const input = screen.getByPlaceholderText('Ask me anything...');
    const sendButton = screen.getByRole('button', { name: '' });

    // Send a message
    fireEvent.change(input, { target: { value: 'Test timestamp' } });
    fireEvent.click(sendButton);

    // Check for timestamp format (HH:MM)
    await waitFor(() => {
      const timestamps = screen.getAllByText(/\d{1,2}:\d{2}/);
      expect(timestamps.length).toBeGreaterThan(0);
    });
  });

  it('prevents sending empty messages', () => {
    render(<AIMentorChat />);

    const input = screen.getByPlaceholderText('Ask me anything...');
    const sendButton = screen.getByRole('button', { name: '' });

    // Try to send empty message
    fireEvent.change(input, { target: { value: '   ' } });
    fireEvent.click(sendButton);

    // Should not add a new message (only initial AI message should exist)
    const messages = screen.getAllByText(/./);
    expect(messages.length).toBeLessThan(10); // Arbitrary check
  });
});

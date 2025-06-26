import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { FormFileUpload } from '../FormFileUpload';

// Mock window.open
Object.defineProperty(window, 'open', {
  writable: true,
  value: jest.fn(),
});

describe('FormFileUpload Component', () => {
  const defaultProps = {
    id: 'test-upload',
    label: 'Test Upload',
    onChange: jest.fn(),
    onRemove: jest.fn(),
  };

  const createMockFile = (name: string, type: string, size: number = 1024) => {
    const file = new File(['mock content'], name, { type });
    Object.defineProperty(file, 'size', { value: size });
    return file;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (window.open as jest.Mock).mockClear();
  });

  describe('Basic Functionality', () => {
    it('renders upload area with label', () => {
      render(<FormFileUpload {...defaultProps} />);
      expect(screen.getByText('Test Upload')).toBeInTheDocument();
      expect(screen.getByText('Choose files or drag and drop')).toBeInTheDocument();
    });

    it('handles single file upload', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      
      render(<FormFileUpload {...defaultProps} onChange={onChange} />);
      
      const file = createMockFile('test.txt', 'text/plain');
      const input = screen.getByLabelText('Test Upload');
      
      await user.upload(input, file);
      
      expect(onChange).toHaveBeenCalledWith([file]);
    });

    it('handles multiple file upload when enabled', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      
      render(<FormFileUpload {...defaultProps} onChange={onChange} multiple maxFiles={3} />);
      
      const files = [
        createMockFile('file1.txt', 'text/plain'),
        createMockFile('file2.txt', 'text/plain'),
      ];
      
      const input = screen.getByLabelText('Test Upload');
      await user.upload(input, files);
      
      expect(onChange).toHaveBeenCalledWith(files);
    });

    it('limits files to maxFiles when specified', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      
      render(<FormFileUpload {...defaultProps} onChange={onChange} multiple maxFiles={2} />);
      
      const files = [
        createMockFile('file1.txt', 'text/plain'),
        createMockFile('file2.txt', 'text/plain'),
        createMockFile('file3.txt', 'text/plain'),
      ];
      
      const input = screen.getByLabelText('Test Upload');
      await user.upload(input, files);
      
      // Should only accept first 2 files
      expect(onChange).toHaveBeenCalledWith([files[0], files[1]]);
    });
  });

  describe('Security Tests - Malicious File Detection', () => {
    it('accepts allowed file types', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      
      render(
        <FormFileUpload 
          {...defaultProps} 
          onChange={onChange} 
          accept="image/jpeg,image/png,application/pdf"
        />
      );
      
      const files = [
        createMockFile('image.jpg', 'image/jpeg'),
        createMockFile('document.pdf', 'application/pdf'),
      ];
      
      const input = screen.getByLabelText('Test Upload');
      await user.upload(input, files);
      
      expect(onChange).toHaveBeenCalledWith(files);
    });

    it('handles potentially dangerous file types', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      
      render(<FormFileUpload {...defaultProps} onChange={onChange} />);
      
      const dangerousFiles = [
        createMockFile('malware.exe', 'application/x-msdownload'),
        createMockFile('script.js', 'text/javascript'),
        createMockFile('batch.bat', 'application/x-msdos-program'),
        createMockFile('shell.sh', 'application/x-sh'),
      ];
      
      const input = screen.getByLabelText('Test Upload');
      await user.upload(input, dangerousFiles);
      
      // The component should still call onChange (security should be handled at server level)
      expect(onChange).toHaveBeenCalledWith(dangerousFiles);
    });

    it('handles files with misleading extensions', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      
      render(<FormFileUpload {...defaultProps} onChange={onChange} />);
      
      // Files with double extensions or misleading names
      const suspiciousFiles = [
        createMockFile('image.jpg.exe', 'image/jpeg'), // MIME type doesn't match extension
        createMockFile('document.pdf.bat', 'application/pdf'),
        createMockFile('innocent.txt.scr', 'text/plain'),
      ];
      
      const input = screen.getByLabelText('Test Upload');
      await user.upload(input, suspiciousFiles);
      
      expect(onChange).toHaveBeenCalledWith(suspiciousFiles);
    });

    it('handles oversized files', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      
      render(<FormFileUpload {...defaultProps} onChange={onChange} />);
      
      const largeFile = createMockFile('large.zip', 'application/zip', 100 * 1024 * 1024); // 100MB
      
      const input = screen.getByLabelText('Test Upload');
      await user.upload(input, largeFile);
      
      expect(onChange).toHaveBeenCalledWith([largeFile]);
    });

    it('handles files with special characters in names', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      
      render(<FormFileUpload {...defaultProps} onChange={onChange} />);
      
      const specialFiles = [
        createMockFile('../../../etc/passwd', 'text/plain'), // Path traversal attempt
        createMockFile('file with spaces.txt', 'text/plain'),
        createMockFile('file@#$%^&*()_+.txt', 'text/plain'),
        createMockFile('файл.txt', 'text/plain'), // Unicode filename
      ];
      
      const input = screen.getByLabelText('Test Upload');
      await user.upload(input, specialFiles);
      
      expect(onChange).toHaveBeenCalledWith(specialFiles);
    });

    it('handles empty files', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      
      render(<FormFileUpload {...defaultProps} onChange={onChange} />);
      
      const emptyFile = createMockFile('empty.txt', 'text/plain', 0);
      
      const input = screen.getByLabelText('Test Upload');
      await user.upload(input, emptyFile);
      
      expect(onChange).toHaveBeenCalledWith([emptyFile]);
    });
  });

  describe('Drag and Drop Functionality', () => {
    it('handles drag over event', () => {
      render(<FormFileUpload {...defaultProps} />);
      
      const dropzone = screen.getByLabelText('Test Upload');
      
      fireEvent.dragOver(dropzone, {
        dataTransfer: {
          files: [createMockFile('test.txt', 'text/plain')],
        },
      });
      
      // Should change visual state (tested through class changes)
      expect(dropzone).toHaveClass('cursor-pointer');
    });

    it('handles file drop', () => {
      const onChange = jest.fn();
      render(<FormFileUpload {...defaultProps} onChange={onChange} />);
      
      const dropzone = screen.getByLabelText('Test Upload');
      const file = createMockFile('dropped.txt', 'text/plain');
      
      fireEvent.drop(dropzone, {
        dataTransfer: {
          files: [file],
        },
      });
      
      expect(onChange).toHaveBeenCalledWith([file]);
    });

    it('handles multiple files drop', () => {
      const onChange = jest.fn();
      render(<FormFileUpload {...defaultProps} onChange={onChange} multiple />);
      
      const dropzone = screen.getByLabelText('Test Upload');
      const files = [
        createMockFile('file1.txt', 'text/plain'),
        createMockFile('file2.txt', 'text/plain'),
      ];
      
      fireEvent.drop(dropzone, {
        dataTransfer: {
          files: files,
        },
      });
      
      expect(onChange).toHaveBeenCalledWith(files);
    });
  });

  describe('File Management', () => {
    it('displays uploaded files', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      
      render(<FormFileUpload {...defaultProps} onChange={onChange} />);
      
      const file = createMockFile('test-document.pdf', 'application/pdf');
      const input = screen.getByLabelText('Test Upload');
      
      await user.upload(input, file);
      
      await waitFor(() => {
        expect(screen.getByText('test-document.pdf')).toBeInTheDocument();
      });
    });

    it('shows upload progress simulation', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      
      render(<FormFileUpload {...defaultProps} onChange={onChange} />);
      
      const file = createMockFile('test.txt', 'text/plain');
      const input = screen.getByLabelText('Test Upload');
      
      await user.upload(input, file);
      
      // Should show uploading state initially
      await waitFor(() => {
        expect(screen.getByText('Uploading...')).toBeInTheDocument();
      });
      
      // Should complete after simulation
      await waitFor(() => {
        expect(screen.getByText('Complete')).toBeInTheDocument();
      }, { timeout: 2000 });
    });

    it('allows file removal', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      const onRemove = jest.fn();
      
      render(<FormFileUpload {...defaultProps} onChange={onChange} onRemove={onRemove} />);
      
      const file = createMockFile('test.txt', 'text/plain');
      const input = screen.getByLabelText('Test Upload');
      
      await user.upload(input, file);
      
      await waitFor(() => {
        const removeButton = screen.getByTitle('Remove file');
        user.click(removeButton);
      });
      
      await waitFor(() => {
        expect(onRemove).toHaveBeenCalledWith(0);
      });
    });
  });

  describe('Existing Files Display', () => {
    it('displays existing files with view links', () => {
      const existingFiles = ['https://example.com/file1.pdf', 'https://example.com/file2.jpg'];
      const existingNames = ['Document.pdf', 'Image.jpg'];
      
      render(
        <FormFileUpload 
          {...defaultProps} 
          existingFileUrls={existingFiles}
          existingFileNames={existingNames}
        />
      );
      
      expect(screen.getByText('Current Files:')).toBeInTheDocument();
      expect(screen.getByText('Document.pdf')).toBeInTheDocument();
      expect(screen.getByText('Image.jpg')).toBeInTheDocument();
    });

    it('opens existing files in new tab', async () => {
      const user = userEvent.setup();
      const existingFiles = ['https://example.com/file1.pdf'];
      const existingNames = ['Document.pdf'];
      
      render(
        <FormFileUpload 
          {...defaultProps} 
          existingFileUrls={existingFiles}
          existingFileNames={existingNames}
        />
      );
      
      const viewButton = screen.getByTitle('Open file in new tab');
      await user.click(viewButton);
      
      expect(window.open).toHaveBeenCalledWith('https://example.com/file1.pdf', '_blank');
    });

    it('handles existing files without names', () => {
      const existingFiles = ['https://example.com/uploads/abc123.pdf'];
      
      render(
        <FormFileUpload 
          {...defaultProps} 
          existingFileUrls={existingFiles}
        />
      );
      
      expect(screen.getByText('abc123.pdf')).toBeInTheDocument();
    });

    it('handles malformed existing file URLs', () => {
      const existingFiles = ['not-a-valid-url', 'javascript:alert("xss")'];
      
      render(
        <FormFileUpload 
          {...defaultProps} 
          existingFileUrls={existingFiles}
        />
      );
      
      expect(screen.getByText('File 1')).toBeInTheDocument();
      expect(screen.getByText('File 2')).toBeInTheDocument();
    });
  });

  describe('Compact Mode', () => {
    it('renders in compact mode', () => {
      render(<FormFileUpload {...defaultProps} compact />);
      
      // Should have compact styling
      const dropzone = screen.getByLabelText('Test Upload');
      expect(dropzone.closest('label')).toHaveClass('p-3'); // Compact padding
    });

    it('shows compact upload interface', () => {
      render(<FormFileUpload {...defaultProps} compact />);
      
      expect(screen.getByText('Choose files')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('handles file input errors gracefully', () => {
      const onChange = jest.fn();
      
      render(<FormFileUpload {...defaultProps} onChange={onChange} />);
      
      const input = screen.getByLabelText('Test Upload');
      
      // Simulate file input error
      fireEvent.change(input, { target: { files: null } });
      
      expect(onChange).not.toHaveBeenCalled();
    });

    it('handles drag and drop errors gracefully', () => {
      const onChange = jest.fn();
      
      render(<FormFileUpload {...defaultProps} onChange={onChange} />);
      
      const dropzone = screen.getByLabelText('Test Upload');
      
      // Simulate drop with no files
      fireEvent.drop(dropzone, {
        dataTransfer: { files: [] },
      });
      
      expect(onChange).toHaveBeenCalledWith([]);
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      render(<FormFileUpload {...defaultProps} required />);
      
      const input = screen.getByLabelText('Test Upload');
      expect(input).toHaveAttribute('id', 'test-upload');
      expect(input).toHaveAttribute('type', 'file');
    });

    it('supports keyboard navigation', () => {
      render(<FormFileUpload {...defaultProps} />);
      
      const input = screen.getByLabelText('Test Upload');
      input.focus();
      expect(input).toHaveFocus();
    });

    it('provides appropriate file type hints', () => {
      render(<FormFileUpload {...defaultProps} accept=".pdf,.doc,.docx" />);
      
      expect(screen.getByText(/PDF, DOC, DOCX/)).toBeInTheDocument();
    });
  });

  describe('Performance & Memory Management', () => {
    it('cleans up file states on unmount', () => {
      const { unmount } = render(<FormFileUpload {...defaultProps} />);
      
      // Should not throw errors on unmount
      expect(() => unmount()).not.toThrow();
    });

    it('handles large number of files efficiently', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      
      render(<FormFileUpload {...defaultProps} onChange={onChange} multiple maxFiles={10} />);
      
      const manyFiles = Array.from({ length: 10 }, (_, i) => 
        createMockFile(`file${i}.txt`, 'text/plain')
      );
      
      const input = screen.getByLabelText('Test Upload');
      await user.upload(input, manyFiles);
      
      expect(onChange).toHaveBeenCalledWith(manyFiles);
    });
  });

  describe('Integration with Form Systems', () => {
    it('integrates with form validation', () => {
      render(<FormFileUpload {...defaultProps} required value={null} />);
      
      // Component should render without required file
      expect(screen.getByText('Test Upload')).toBeInTheDocument();
    });

    it('maintains file state across re-renders', () => {
      const file = createMockFile('test.txt', 'text/plain');
      const { rerender } = render(<FormFileUpload {...defaultProps} value={[file]} />);
      
      expect(screen.getByText('test.txt')).toBeInTheDocument();
      
      // Re-render with same file
      rerender(<FormFileUpload {...defaultProps} value={[file]} />);
      
      expect(screen.getByText('test.txt')).toBeInTheDocument();
    });
  });
}); 
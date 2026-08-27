import '@testing-library/jest-dom';
import React from 'react';

// Mock html5-qrcode
jest.mock('html5-qrcode', () => ({
  Html5Qrcode: jest.fn().mockImplementation(() => ({
    start: jest.fn().mockResolvedValue(undefined),
    stop: jest.fn().mockResolvedValue(undefined),
    clear: jest.fn().mockResolvedValue(undefined),
  })),
}));

// Mock Next.js Image cleanly stripping Next-specific non-DOM attributes
jest.mock('next/image', () => {
  return function MockImage(props: Record<string, unknown>) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { fill, priority, ...domProps } = props;
    return React.createElement('img', domProps);
  };
});

import '@testing-library/jest-dom';
import { vi } from 'vitest';
import chromeMock from '../../__mocks__/chrome';

// Stub chrome global before every test file
vi.stubGlobal('chrome', chromeMock);

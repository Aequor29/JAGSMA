// jest.setup.ts
import "@testing-library/jest-dom";
import "whatwg-fetch";
import fetchMock from "jest-fetch-mock";
fetchMock.enableMocks();
// Mock for window.matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false, // Set to true if you want to simulate a match
    media: query,
    onchange: null,
    addListener: jest.fn(), // Deprecated
    removeListener: jest.fn(), // Deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

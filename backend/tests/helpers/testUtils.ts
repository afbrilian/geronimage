import type { Request, Response } from 'express'

export const createMockRequest = (body: any = {}): Partial<Request> => ({
  body,
  params: {},
  query: {},
})

export const createMockResponse = (): Partial<Response> => {
  const res: Partial<Response> = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
  }
  return res
}

export const wait = (ms: number) =>
  new Promise(resolve => setTimeout(resolve, ms))

export const mockJobData = {
  prompt: 'test rocket',
  styleId: 1,
  colors: ['#FF0000', '#0000FF'],
}


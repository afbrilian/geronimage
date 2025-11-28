import { Request, Response, NextFunction } from 'express'

export interface ApiError extends Error {
  status?: number
  statusCode?: number
}

export function errorHandler(
  err: ApiError,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  // Log error for debugging
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  })

  // Determine status code
  const statusCode = err.status || err.statusCode || 500

  // Send error response
  res.status(statusCode).json({
    error: err.message || 'Internal server error',
    status: statusCode,
    path: req.path,
    timestamp: new Date().toISOString(),
  })
}

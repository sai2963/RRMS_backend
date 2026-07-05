import { Response } from 'express';
import { HTTP_STATUS } from '../constants';
import { ApiSuccessResponse, ApiErrorResponse, PaginationMeta } from '../types';

export const sendSuccess = <T>(
  res: Response,
  data: T,
  message: string = 'Success',
  statusCode: number = HTTP_STATUS.OK,
): Response<ApiSuccessResponse<T>> => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

export const sendCreated = <T>(
  res: Response,
  data: T,
  message: string = 'Created successfully',
): Response<ApiSuccessResponse<T>> => {
  return sendSuccess(res, data, message, HTTP_STATUS.CREATED);
};

export const sendError = (
  res: Response,
  message: string,
  statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR,
  errors?: Record<string, string[]>,
): Response<ApiErrorResponse> => {
  return res.status(statusCode).json({
    success: false,
    message,
    ...(errors && { errors }),
  });
};

export const buildPaginationMeta = (
  totalCount: number,
  page: number,
  pageSize: number,
): PaginationMeta => ({
  page,
  pageSize,
  totalCount,
  totalPages: Math.ceil(totalCount / pageSize),
});

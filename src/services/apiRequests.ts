import type { AxiosError, AxiosResponse } from "axios";
import {
  instance as axiosUser,
  EcosystemInstance as ecosystemAxiosUser,
} from "./axiosIntercepter";
import { APILogger } from "../utils/logger";

export interface APIParameters {
  url: string;
  payload?: Record<never, unknown>;
  config?: Record<string, unknown>;
}

export const axiosGet = async ({
  url,
  config,
}: APIParameters): Promise<AxiosResponse> => {
  const startTime = Date.now();

  // Log the request
  APILogger.logRequest("GET", url, undefined, config);

  try {
    const response = await axiosUser.get(url, config);
    const duration = Date.now() - startTime;

    // Log successful response
    APILogger.logResponse("GET", url, response.status, response.data, duration);

    return response;
  } catch (error) {
    const duration = Date.now() - startTime;
    const err = error as AxiosError;

    // Log the error
    APILogger.logError("GET", url, err, duration);

    return HandleResponse(err.response ? err.response : err);
  }
};
export const axiosPublicUserGet = async ({
  url,
}: APIParameters): Promise<AxiosResponse> => {
  try {
    const response = await axiosUser.get(url);

    return response;
  } catch (error) {
    const err = error as AxiosError;
    return HandleResponse(err.response ? err.response : err);
  }
};

export const axiosPublicOrganisationGet = async ({
  url,
}: APIParameters): Promise<AxiosResponse> => {
  try {
    const response = await axiosUser.get(url);

    return response;
  } catch (error) {
    const err = error as AxiosError;
    return HandleResponse(err.response ? err.response : err);
  }
};

export const axiosPost = async ({
  url,
  payload,
  config,
}: APIParameters): Promise<AxiosResponse> => {
  const startTime = Date.now();

  // Log the request
  APILogger.logRequest("POST", url, payload, config);

  try {
    const response = await axiosUser.post(url, payload, config);
    const duration = Date.now() - startTime;

    // Log successful response
    APILogger.logResponse("POST", url, response.status, response.data, duration);

    return response;
  } catch (error) {
    const duration = Date.now() - startTime;
    const err = error as AxiosError;

    // Log the error
    APILogger.logError("POST", url, err, duration);

    return HandleResponse(err.response ? err.response : err);
  }
};

export const axiosPatch = async ({
  url,
  payload,
  config,
}: APIParameters): Promise<AxiosResponse> => {
  const startTime = Date.now();

  // Log the request
  APILogger.logRequest("PATCH", url, payload, config);

  try {
    const response = await axiosUser.patch(url, payload, config);
    const duration = Date.now() - startTime;

    // Log successful response
    APILogger.logResponse("PATCH", url, response.status, response.data, duration);

    return response;
  } catch (error) {
    const duration = Date.now() - startTime;
    const err = error as AxiosError;

    // Log the error
    APILogger.logError("PATCH", url, err, duration);

    return HandleResponse(err.response ? err.response : err);
  }
};

export const axiosPut = async ({
  url,
  payload,
  config,
}: APIParameters): Promise<AxiosResponse> => {
  const startTime = Date.now();

  // Log the request
  APILogger.logRequest("PUT", url, payload, config);

  try {
    const response = await axiosUser.put(url, payload, config);
    const duration = Date.now() - startTime;

    // Log successful response
    APILogger.logResponse("PUT", url, response.status, response.data, duration);

    return response;
  } catch (error) {
    const duration = Date.now() - startTime;
    const err = error as AxiosError;

    // Log the error
    APILogger.logError("PUT", url, err, duration);

    return HandleResponse(err.response ? err.response : err);
  }
};

export const axiosDelete = async ({
  url,
  config,
}: APIParameters): Promise<AxiosResponse> => {
  const startTime = Date.now();

  // Log the request
  APILogger.logRequest("DELETE", url, undefined, config);

  try {
    const response = await axiosUser.delete(url, config);
    const duration = Date.now() - startTime;

    // Log successful response
    APILogger.logResponse("DELETE", url, response.status, response.data, duration);

    return response;
  } catch (error) {
    const duration = Date.now() - startTime;
    const err = error as AxiosError;

    // Log the error
    APILogger.logError("DELETE", url, err, duration);

    return HandleResponse(err.response ? err.response : err);
  }
};

export const ecosystemAxiosGet = async ({
  url,
  config,
}: APIParameters): Promise<AxiosResponse> => {
  try {
    const response = await ecosystemAxiosUser.get(url, config);

    return response;
  } catch (error) {
    const err = error as AxiosError;
    return HandleResponse(err.response ? err.response : err);
  }
};
export const ecosystemAxiosPublicUserGet = async ({
  url,
}: APIParameters): Promise<AxiosResponse> => {
  try {
    const response = await ecosystemAxiosUser.get(url);

    return response;
  } catch (error) {
    const err = error as AxiosError;
    return HandleResponse(err.response ? err.response : err);
  }
};

export const ecosystemAxiosPublicOrganisationGet = async ({
  url,
}: APIParameters): Promise<AxiosResponse> => {
  try {
    const response = await ecosystemAxiosUser.get(url);

    return response;
  } catch (error) {
    const err = error as AxiosError;
    return HandleResponse(err.response ? err.response : err);
  }
};

export const ecosystemAxiosPost = async ({
  url,
  payload,
  config,
}: APIParameters): Promise<AxiosResponse> => {
  try {
    const response = await ecosystemAxiosUser.post(url, payload, config);

    return response;
  } catch (error) {
    const err = error as AxiosError;
    return HandleResponse(err.response ? err.response : err);
  }
};

export const ecosystemAxiosPatch = async ({
  url,
  payload,
  config,
}: APIParameters): Promise<AxiosResponse> => {
  try {
    const response = await ecosystemAxiosUser.patch(url, payload, config);

    return response;
  } catch (error) {
    const err = error as AxiosError;
    return HandleResponse(err.response ? err.response : err);
  }
};

export const ecosystemAxiosPut = async ({
  url,
  payload,
  config,
}: APIParameters): Promise<AxiosResponse> => {
  try {
    const response = await ecosystemAxiosUser.put(url, payload, config);

    return response;
  } catch (error) {
    const err = error as AxiosError;
    return HandleResponse(err.response ? err.response : err);
  }
};

export const ecosystemAxiosDelete = async ({
  url,
  config,
}: APIParameters): Promise<AxiosResponse> => {
  try {
    const response = await ecosystemAxiosUser.delete(url, config);

    return response;
  } catch (error) {
    const err = error as AxiosError;
    return HandleResponse(err.response ? err.response : err);
  }
};

const HandleResponse = (responseData: any): Promise<AxiosResponse> => {
  if (responseData) {
    return Promise.reject(
      new Error(
        responseData?.data?.message
          ? responseData?.data?.message
          : responseData?.message
          ? responseData?.message
          : "Something went wrong, please try later..."
      )
    );
  } else {
    return Promise.reject(
      new Error("Please check your internet connectivity and try again")
    );
  }
};

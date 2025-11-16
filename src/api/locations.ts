import { axiosGet } from "../services/apiRequests";
import { apiRoutes } from "../config/apiRoutes";

export interface Country {
  id: string;
  name: string;
  countryCode: string; // Changed from 'code' to 'countryCode' to match API response
}

export interface State {
  id: string;
  name: string;
  stateCode: string; // Changed from 'code' to 'stateCode' to match API response pattern
  countryId: string;
  countryCode: string;
}

export interface City {
  id: string;
  name: string;
  cityCode: string; // Changed from 'code' to 'cityCode' to match API response pattern
  stateId: string;
  stateCode: string;
  countryCode: string;
}

export interface Regulator {
  id: string;
  name: string;
  abbreviation: string;
  countryId: string;
  countryCode: string;
  sector: string;
  description: string;
}

// New code-based API functions using message patterns
export const getCountriesWithCodes = async () => {
  // Try new geo endpoint first, fallback to legacy endpoint
  let url = `${apiRoutes.geo.countriesWithCodes}`;
  console.log("Countries API URL:", url);
  console.log("Full apiRoutes.geo:", apiRoutes.geo);

  const config = {
    headers: {
      "Content-Type": "application/json",
    },
  };

  let axiosPayload = {
    url,
    config,
  };

  try {
    return await axiosGet(axiosPayload);
  } catch (error) {
    // Fallback to legacy endpoint
    try {
      url = `${apiRoutes.locations.countries}`;
      axiosPayload = {
        url,
        config,
      };
      return await axiosGet(axiosPayload);
    } catch (fallbackError) {
      const err = fallbackError as Error;
      return err?.message;
    }
  }
};

export const getStatesByCountryCode = async (countryCode: string) => {
  // Try new geo endpoint first, fallback to legacy with query parameters
  let url = `${apiRoutes.geo.statesByCountryCode}/${countryCode}/states`;

  const config = {
    headers: {
      "Content-Type": "application/json",
    },
  };

  let axiosPayload = {
    url,
    config,
  };

  try {
    return await axiosGet(axiosPayload);
  } catch (error) {
    // Fallback to legacy endpoint with query parameters
    try {
      url = `${apiRoutes.locations.states}?countryCode=${countryCode}`;
      axiosPayload = {
        url,
        config,
      };
      return await axiosGet(axiosPayload);
    } catch (fallbackError) {
      const err = fallbackError as Error;
      return err?.message;
    }
  }
};

export const getCitiesByStateCode = async (stateCode: string) => {
  // Try new geo endpoint first, fallback to legacy with query parameters
  let url = `${apiRoutes.geo.citiesByStateCode}/${stateCode}/cities`;

  const config = {
    headers: {
      "Content-Type": "application/json",
    },
  };

  let axiosPayload = {
    url,
    config,
  };

  try {
    return await axiosGet(axiosPayload);
  } catch (error) {
    // Fallback to legacy endpoint with query parameters
    try {
      url = `${apiRoutes.locations.cities}?stateCode=${stateCode}`;
      axiosPayload = {
        url,
        config,
      };
      return await axiosGet(axiosPayload);
    } catch (fallbackError) {
      const err = fallbackError as Error;
      return err?.message;
    }
  }
};

export const getCitiesByCountryAndState = async (
  countryCode: string,
  stateCode: string
) => {
  // Try new geo endpoint first, fallback to legacy with query parameters
  let url = `${apiRoutes.geo.citiesByCountryAndState}/${countryCode}/states/${stateCode}/cities`;

  const config = {
    headers: {
      "Content-Type": "application/json",
    },
  };

  let axiosPayload = {
    url,
    config,
  };

  try {
    return await axiosGet(axiosPayload);
  } catch (error) {
    // Fallback to legacy endpoint with query parameters
    try {
      url = `${apiRoutes.locations.cities}?countryCode=${countryCode}&stateCode=${stateCode}`;
      axiosPayload = {
        url,
        config,
      };
      return await axiosGet(axiosPayload);
    } catch (fallbackError) {
      const err = fallbackError as Error;
      return err?.message;
    }
  }
};

export const getRegulatorsByCountryCode = async (countryCode: string) => {
  // Try new geo endpoint first, fallback to legacy with query parameters
  let url = `${apiRoutes.geo.regulatorsByCountryCode}/${countryCode}`;
  console.log("Regulators API URL (primary):", url);

  const config = {
    headers: {
      "Content-Type": "application/json",
    },
  };

  let axiosPayload = {
    url,
    config,
  };

  try {
    console.log("Attempting regulators API call with payload:", axiosPayload);
    return await axiosGet(axiosPayload);
  } catch (error) {
    console.log(
      "Primary regulators API failed, trying fallback:",
      error.message
    );
    // Fallback to legacy endpoint with query parameters
    try {
      url = `${apiRoutes.locations.regulators}?countryCode=${countryCode}`;
      console.log("Regulators API URL (fallback):", url);
      axiosPayload = {
        url,
        config,
      };
      console.log(
        "Attempting regulators fallback API call with payload:",
        axiosPayload
      );
      return await axiosGet(axiosPayload);
    } catch (fallbackError) {
      const err = fallbackError as Error;
      return err?.message;
    }
  }
};

// Legacy ID-based functions (kept for backward compatibility)
export const getCountries = async () => {
  console.warn("getCountries is deprecated, use getCountriesWithCodes instead");
  const url = `${apiRoutes.locations.countries}`;

  const config = {
    headers: {
      "Content-Type": "application/json",
    },
  };

  const axiosPayload = {
    url,
    config,
  };

  try {
    return await axiosGet(axiosPayload);
  } catch (error) {
    const err = error as Error;
    return err?.message;
  }
};

export const getStates = async (countryId: string) => {
  console.warn("getStates is deprecated, use getStatesByCountryCode instead");
  const url = `${apiRoutes.locations.states}?countryId=${countryId}`;

  const config = {
    headers: {
      "Content-Type": "application/json",
    },
  };

  const axiosPayload = {
    url,
    config,
  };

  try {
    return await axiosGet(axiosPayload);
  } catch (error) {
    const err = error as Error;
    return err?.message;
  }
};

export const getCities = async (stateId: string) => {
  console.warn("getCities is deprecated, use getCitiesByStateCode instead");
  const url = `${apiRoutes.locations.cities}?stateId=${stateId}`;

  const config = {
    headers: {
      "Content-Type": "application/json",
    },
  };

  const axiosPayload = {
    url,
    config,
  };

  try {
    return await axiosGet(axiosPayload);
  } catch (error) {
    const err = error as Error;
    return err?.message;
  }
};

export const getRegulators = async (countryId: string) => {
  console.warn(
    "getRegulators is deprecated, use getRegulatorsByCountryCode instead"
  );
  const url = `${apiRoutes.locations.regulators}?countryId=${countryId}`;

  const config = {
    headers: {
      "Content-Type": "application/json",
    },
  };

  const axiosPayload = {
    url,
    config,
  };

  try {
    return await axiosGet(axiosPayload);
  } catch (error) {
    const err = error as Error;
    return err?.message;
  }
};

// Validation functions for geographic codes
export const validateCountryCode = async (countryCode: string) => {
  const url = `${apiRoutes.geo.validate.country}/${countryCode}`;

  const config = {
    headers: {
      "Content-Type": "application/json",
    },
  };

  const axiosPayload = {
    url,
    config,
  };

  try {
    return await axiosGet(axiosPayload);
  } catch (error) {
    const err = error as Error;
    return err?.message;
  }
};

export const validateStateCode = async (stateCode: string) => {
  const url = `${apiRoutes.geo.validate.state}/${stateCode}`;

  const config = {
    headers: {
      "Content-Type": "application/json",
    },
  };

  const axiosPayload = {
    url,
    config,
  };

  try {
    return await axiosGet(axiosPayload);
  } catch (error) {
    const err = error as Error;
    return err?.message;
  }
};

export const validateCityCode = async (cityCode: string) => {
  const url = `${apiRoutes.geo.validate.city}/${cityCode}`;

  const config = {
    headers: {
      "Content-Type": "application/json",
    },
  };

  const axiosPayload = {
    url,
    config,
  };

  try {
    return await axiosGet(axiosPayload);
  } catch (error) {
    const err = error as Error;
    return err?.message;
  }
};

// Comprehensive validation function for geographic codes
export const validateGeographicCodes = async (
  countryCode: string,
  stateCode: string,
  cityCode: string
) => {
  try {
    // Validate country
    const countryResponse = await validateCountryCode(countryCode);
    const countryData = (countryResponse as any)?.data;
    if (!countryData || countryData.statusCode !== 200) {
      throw new Error("Invalid country code");
    }

    // Validate state
    const stateResponse = await validateStateCode(stateCode);
    const stateData = (stateResponse as any)?.data;
    if (!stateData || stateData.statusCode !== 200) {
      throw new Error("Invalid state code");
    }

    // Validate city
    const cityResponse = await validateCityCode(cityCode);
    const cityData = (cityResponse as any)?.data;
    if (!cityData || cityData.statusCode !== 200) {
      throw new Error("Invalid city code");
    }

    return {
      valid: true,
      country: countryData.data,
      state: stateData.data,
      city: cityData.data,
    };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : "Validation failed",
    };
  }
};

import { axiosDelete, axiosGet, axiosPost } from "../services/apiRequests";
import { apiRoutes } from "../config/apiRoutes";
import { getFromLocalStorage } from "./Auth";
import { storageKeys } from "../config/CommonConstant";
import { getHeaderConfigs } from "../config/GetHeaderConfigs";

export const getLedgerConfig = async () => {
  const token = await getFromLocalStorage(storageKeys.TOKEN)
  const details = {
    url: `${apiRoutes.organizations.root}${apiRoutes.Agent.getLedgerConfig}`,
    config: {
      headers: {
        'Content-type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    },
  };

  try {
    const response = await axiosGet(details)
    return response
  }
  catch (error) {
    const err = error as Error
    return err?.message
  }
}

export const createPolygonKeyValuePair = async (orgId:string) => {
  const token = await getFromLocalStorage(storageKeys.TOKEN)
  const details = {
    url: `${apiRoutes.organizations.root}/${orgId}${apiRoutes.Agent.createPolygonKeys}`,
    config: {
      headers: {
        'Content-type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    },
  };

  try {
    const response = await axiosPost(details)
    return response
  }
  catch (error) {
    const err = error as Error
    return err?.message
  }
}

export const getAgentHealth = async (orgId:string) => {
  const token = await getFromLocalStorage(storageKeys.TOKEN)
  const details = {
    url: `${apiRoutes.organizations.root}/${orgId}${apiRoutes.Agent.checkAgentHealth}`,
    config: {
      headers: {
        'Content-type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    },
  };

  console.log('🔍 Agent Health API Request:', {
    method: 'GET',
    url: details.url,
    orgId: orgId,
    headers: details.config.headers,
    timestamp: new Date().toISOString()
  });

  try {
    const response = await axiosGet(details)
    console.log('✅ Agent Health API Response:', {
      status: response.status,
      statusText: response.statusText,
      data: response.data,
      timestamp: new Date().toISOString()
    });
    return response
  }
  catch (error) {
    const err = error as Error
    console.error('❌ Agent Health API Error:', {
      error: err?.message,
      orgId: orgId,
      timestamp: new Date().toISOString()
    });
    return err?.message
  }
}

export const getLedgers = async () => {
  const token = await getFromLocalStorage(storageKeys.TOKEN)
  const details = {
    url: `${apiRoutes.Platform.getLedgers}`,
    config: {
      headers: {
        'Content-type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    },
  };

  try {
    const response = await axiosGet(details)
    return response
  }
  catch (error) {
    const err = error as Error
    return err?.message
  }
}

export const getLedgersPlatformUrl = async (indyNamespace: string) => {
  const token = await getFromLocalStorage(storageKeys.TOKEN)
  const details = {
    url: `${apiRoutes.Platform.getLedgerPlatformUrl}${indyNamespace}`,
    config: {
      headers: {
        'Content-type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    },
  };

  try {
    const response = await axiosGet(details)
    return response
  }
  catch (error) {
    const err = error as Error
    return err?.message
  }
}


export const deleteOrganizationWallet = async (
) => {
	const orgId = await getFromLocalStorage(storageKeys.ORG_ID);

	const url = `${apiRoutes.organizations.root}/${orgId}${apiRoutes.Agent.deleteWallet}`;

	const axiosPayload = {
		url,
		config: await getHeaderConfigs(),
	};

	try {
		return await axiosDelete(axiosPayload);
	} catch (error) {
		const err = error as Error;
		return err?.message;
	}
};
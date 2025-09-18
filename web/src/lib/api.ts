
export const callApi = async (endpoint: string, data: any, method?: string = 'GET') => {
    return await fetch(`${endpoint}`, {
        method,
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
};

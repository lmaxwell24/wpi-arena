
export const callApi = async (endpoint: string, data: any, method?: string = 'GET') => {
    return await fetch(`http://${window.location.hostname}:8080${endpoint}`, {
        method,
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
};

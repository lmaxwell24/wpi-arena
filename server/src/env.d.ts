declare global {
	namespace NodeJS {
		interface ProcessEnv {
			TF_API_USER: string;
			TF_API_KEY: string;
			TF_TOURNAMENT_IDS: string;
			TOURNAMENT_NAME: string;
			PORT: string;
			IP: string;
			MATCH_TIME: string;
		}
	}
}

export {};

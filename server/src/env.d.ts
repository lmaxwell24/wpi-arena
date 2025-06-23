declare global {
	namespace NodeJS {
		interface ProcessEnv {
			TF_API_USER: string;
			TF_API_KEY: string;
			TF_TOURNAMENT_ID: string;
			TOURNAMENT_NAME: string;
			PORT: string;
			MATCH_TIME: string;
		}
	}
}

export {};

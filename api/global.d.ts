namespace NodeJS {
    interface ProcessEnv {
        PORT: number;
        MINIO_HOST: string;
        MINIO_PORT: string;
        MINIO_ACCESS_KEY: string;
        MINIO_SECRET_KEY: string;
    }
}
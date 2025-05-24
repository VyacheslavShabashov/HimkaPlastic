declare module 'pg' {
  export class Pool {
    constructor(config?: any);
    query(sql: string, params?: any[]): Promise<{ rows: any[] }>;
  }
}

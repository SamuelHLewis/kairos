import * as fs from 'fs';
import * as path from 'path';

interface KairosConfig {
    urgentThreshold: number;
}

const configPath = path.resolve(__dirname, '../kairos.config.json');
const raw = fs.readFileSync(configPath, 'utf-8');
export const config: KairosConfig = JSON.parse(raw)
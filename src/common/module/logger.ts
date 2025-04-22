import * as path from 'path';
import * as fs from 'fs'

export function logErrorToFile(error: any, logFileName = 'error.log') {
    const logDir = path.join(process.cwd(), 'logs')
    const logPath = path.join(logDir, logFileName);

    // TODO: - 로그 타입별로 구분을 해줘야하나?

    // 폴더가 없으면 생성
    if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, {recursive: true});
    }

    const today = new Date().toISOString()
    const errorMessage = `[${today}] ${error?.stack || error}\n`
    fs.appendFileSync(logPath, errorMessage);
}
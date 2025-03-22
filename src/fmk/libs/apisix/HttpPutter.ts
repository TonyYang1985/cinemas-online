import http from 'http';

export const httpPut = async (hostname: string, port: number, path: string, data: string, xApiKey: string, log = false) => {
  return new Promise<number>((resolve, reject) => {
    const options = {
      hostname,
      port,
      path,
      method: 'PUT',
      headers: {
        'X-API-KEY': xApiKey,
        'Content-Type': 'application/json',
        'Content-Length': data.length,
      },
    };
    let statusCode = 200;
    const req = http.request(options, (res) => {
      statusCode = res.statusCode ?? 500;
      if (log) {
        console.log(path, statusCode);
        res.on('data', (d) => {
          process.stdout.write(d);
        });
      }
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(data);
    req.end(() => {
      resolve(statusCode);
    });
  });
};

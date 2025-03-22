import { crypto } from '@footy/fmk/utils/crypto';

export const upstreamUriTemplate = (appName: string) => `/apisix/admin/upstreams/${crypto.md5(`upstream_${appName}`)}`;
export const upstreamTemplate = (appName: string, version: string, port: number) => `{
    "name": "${appName}",
    "type": "roundrobin",
    "nodes": {
        "${appName}:${port}": 1
    },
    "retries": 1,
    "timeout": {
        "connect": 500,
        "send": 500,
        "read": 500
    },
    "enable_websocket": true,
    "checks": {
        "active": {
            "timeout": 5,
            "http_path": "/api/v${version}/${appName}/_healthcheck",
            "host": "${appName}",
            "port": ${port},
            "healthy": {
                "interval": 2,
                "successes": 1
            },
            "unhealthy": {
                "interval": 1,
                "http_failures": 2
            }
        },
        "passive": {
            "healthy": {
                "http_statuses": [
                    200,
                    201
                ],
                "successes": 3
            },
            "unhealthy": {
                "http_statuses": [
                    500
                ],
                "http_failures": 3,
                "tcp_failures": 3
            }
        }
    }
}`;
export const serviceUriTemplate = (appName: string) => `/apisix/admin/services/${crypto.md5(`service_${appName}`)}`;
export const serviceTemplate = (appName: string, enableApiGatewayAuth = false) => `{
	"name": "${appName}",
	"plugins": {
        "prometheus": {},
        "cors": {}, 
        ${enableApiGatewayAuth ? '"fot-usercenter-auth": {},' : ''}
		"limit-count": {
			"count": 200,
			"time_window": 10,
			"rejected_code": 503,
			"key": "remote_addr"
		}
	},
	"enable_websocket": true,
	"upstream_id": "${crypto.md5(`upstream_${appName}`)}"
}`;
export const routeUriTemplate = (appName: string) => `/apisix/admin/routes/${crypto.md5(`route_${appName}`)}`;
export const routeTemplate = (appName: string, domains: string[], apiVersion: string, build: string, version: string) => `{
    "name": "${appName}",
    "uri": "/api/v${apiVersion}/${appName}/*",
    "hosts": ${JSON.stringify(domains)},
    "enable_websocket": true,
    "service_id": "${crypto.md5(`service_${appName}`)}",
    "labels": {
        "API_VERSION": "v${apiVersion}",
        "build": "${build}",
        "version": "${version}"
    }
}`;

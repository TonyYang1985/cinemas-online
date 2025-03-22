/**
 * Network utility functions
 */

/**
 * Gets the first available external IPv4 address from network interfaces
 * @returns The local IP address or 'localhost' if none is available
 */
export async function getLocalIpAddress(): Promise<string> {
    const { networkInterfaces } = await import('os');
    const interfaces = networkInterfaces();
    
    const localIp = Object.values(interfaces)
      .flat()
      .filter(iface => iface && !iface.internal && iface.family === 'IPv4')
      .map(iface => iface?.address)[0] || 'localhost';
      
    return localIp;
  }
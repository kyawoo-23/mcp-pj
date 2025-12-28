import { createMcpHandler } from 'mcp-handler'
import { uniRegistrationTool } from './tools/uni-registration'
import { uniBookingTool } from './tools/uni-booking'

const handler = createMcpHandler(
  (server) => {
    // Register tools
    uniRegistrationTool(server)
    uniBookingTool(server)
  },
  {}
)

export { handler as GET, handler as POST }

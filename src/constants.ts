const diamondEvents: string[] = ['DiamondCut', 'DiamondOwnershipTransferred'] as const
const diamondFunctions: string[] = [
  'diamondCut',
  'facetAddress',
  'facetAddresses',
  'facetFunctionSelectors',
  'facets',
] as const

const interfaceEvents: string[] = [] as const
const interfaceFunctions: string[] = ['supportsInterface'] as const

const ownerEvents: string[] = ['OwnershipTransferred'] as const
const ownerFunctions: string[] = ['owner', 'renounceOwnership', 'transferOwnership'] as const

const proxyEvents: string[] = ['Initialized'] as const
const proxyFunctions: string[] = ['initialize'] as const

const accessControlEvents: string[] = ['RoleAdminChanged', 'RoleGranted', 'RoleRevoked'] as const
const accessControlFunctions: string[] = [
  'addAuthorized',
  'authorized',
  'getRoleAdmin',
  'getRoleMember',
  'getRoleMemberCount',
  'grantRole',
  'hasRole',
  'removeAuthorized',
  'renounceRole',
  'revokeRole',
] as const

const pausableEvents: string[] = ['Paused', 'Unpaused'] as const
const pausableFunctions: string[] = ['enabled', 'pause', 'paused', 'unpause', 'toggleEnabled', 'togglePause'] as const

export const unusedEvents: string[] = [
  ...diamondEvents,
  ...interfaceEvents,
  ...ownerEvents,
  ...proxyEvents,
  ...accessControlEvents,
  ...pausableEvents,
] as const

export const unusedFunctions: string[] = [
  ...diamondFunctions,
  ...interfaceFunctions,
  ...ownerFunctions,
  ...proxyFunctions,
  ...accessControlFunctions,
  ...pausableFunctions,
] as const

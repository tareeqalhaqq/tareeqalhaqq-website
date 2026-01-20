export type Role = 'admin' | 'student' | 'member';

const normalizeRole = (value: unknown): Role | null => {
  if (typeof value !== 'string') {
    return null;
  }

  const lowered = value.toLowerCase();
  if (lowered === 'admin' || lowered === 'student' || lowered === 'member') {
    return lowered as Role;
  }

  return null;
};

export const resolveRoleFromMetadata = (
  ...sources: Array<Record<string, unknown> | null | undefined>
): Role | null => {
  for (const source of sources) {
    if (!source) {
      continue;
    }

    const role = normalizeRole(source.app_role ?? source.role);
    if (role) {
      return role;
    }
  }

  return null;
};

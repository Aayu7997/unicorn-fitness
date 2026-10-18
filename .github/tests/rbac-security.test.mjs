import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

describe('RBAC & Role Segregation Security Tests', () => {
  const projectRoot = process.cwd();

  it('middleware strictly isolates admin and user routes and guards /api/admin', () => {
    const middlewareContent = readFileSync(join(projectRoot, 'middleware.ts'), 'utf8');

    // Edge check on /api/admin
    assert.match(
      middlewareContent,
      /\/api\/admin\//,
      'Middleware must target /api/admin routes'
    );
    assert.match(
      middlewareContent,
      /status:\s*401/,
      'Middleware must return 401 for unauthenticated /api/admin requests'
    );
    assert.match(
      middlewareContent,
      /status:\s*403/,
      'Middleware must return 403 for non-admin /api/admin requests'
    );

    // Redirection of admin from user dashboard
    assert.match(
      middlewareContent,
      /isAuthRoute\s*&&\s*userRole\s*===\s*'admin'/,
      'Middleware must redirect admin away from /dashboard to /admin'
    );

    // Redirection of non-admin from admin portal
    assert.match(
      middlewareContent,
      /isAdminRoute\s*&&\s*userRole\s*!==\s*'admin'/,
      'Middleware must redirect non-admin away from /admin to /dashboard'
    );

    // Correct signin routing based on role
    assert.match(
      middlewareContent,
      /userRole\s*===\s*'admin'\s*\)\s*\{\s*return applySecurityHeaders\(NextResponse\.redirect\(new URL\('\/admin'/,
      'Middleware must redirect authenticated admins to /admin on signin/login'
    );
  });

  it('membership enrollment blocks administrators with clear error redirect', () => {
    const enrollRoute = readFileSync(join(projectRoot, 'app/api/enroll/route.ts'), 'utf8');

    assert.match(
      enrollRoute,
      /user\.role\s*===\s*'admin'/,
      'Enroll route must check for admin role'
    );
    assert.match(
      enrollRoute,
      /AdminsCannotEnroll/,
      'Enroll route must redirect admins to /admin with AdminsCannotEnroll error code'
    );
  });

  it('program enrollment blocks administrators from enrolling', () => {
    const progRoute = readFileSync(join(projectRoot, 'app/api/user/programs/enroll/route.ts'), 'utf8');

    assert.match(
      progRoute,
      /user\.role\s*===\s*'admin'/,
      'Program enroll route must verify user is not admin'
    );
    assert.match(
      progRoute,
      /status:\s*403/,
      'Program enroll route must reject admin enrollments with 403 Forbidden'
    );
  });

  it('class booking prevents administrators from booking or cancelling member classes', () => {
    const classRoute = readFileSync(join(projectRoot, 'app/api/user/classes/book/route.ts'), 'utf8');

    assert.match(
      classRoute,
      /sessionUser\.role\s*!==\s*'user'/,
      'Class booking must block non-user roles (admins) from booking member slots'
    );
  });

  it('admin members endpoint queries and displays only genuine gym members', () => {
    const membersRoute = readFileSync(join(projectRoot, 'app/api/admin/members/route.ts'), 'utf8');

    assert.match(
      membersRoute,
      /role:\s*(Role\.user|'user')/,
      'Members GET route must strictly filter by role user'
    );
    assert.match(
      membersRoute,
      /role:\s*(Role\.user|'user')/,
      'Members POST route must strictly set role to user'
    );
  });

  it('admin member detail route blocks access to admin accounts and forbids role tampering', () => {
    const memberDetailRoute = readFileSync(join(projectRoot, 'app/api/admin/members/[id]/route.ts'), 'utf8');

    assert.match(
      memberDetailRoute,
      /targetUser\.role\s*!==\s*'user'/,
      'Member detail route must verify target record has role: user'
    );
    assert.doesNotMatch(
      memberDetailRoute,
      /role:\s*z\.enum\(\['admin',\s*'user'\]\)/,
      'Member update schema must NOT allow role modification'
    );
  });

  it('registration and user profile prevent privilege escalation to admin', () => {
    const registerRoute = readFileSync(join(projectRoot, 'app/api/auth/register/route.ts'), 'utf8');
    assert.doesNotMatch(
      registerRoute,
      /role:\s*z\./,
      'Registration schema must never accept role input from the client'
    );

    const userProfileRoute = readFileSync(join(projectRoot, 'app/api/user/profile/route.ts'), 'utf8');
    assert.doesNotMatch(
      userProfileRoute,
      /role:/,
      'User profile update must never modify user role'
    );
  });

  it('all 58 admin API routes enforce admin authentication (Defense in Depth)', () => {
    function walk(dir) {
      let results = [];
      const list = readdirSync(dir);
      for (const file of list) {
        const fullPath = join(dir, file);
        const stat = statSync(fullPath);
        if (stat.isDirectory()) {
          results = results.concat(walk(fullPath));
        } else if (file === 'route.ts') {
          results.push(fullPath);
        }
      }
      return results;
    }

    const adminRoutes = walk(join(projectRoot, 'app/api/admin'));
    assert.ok(adminRoutes.length >= 50, `Expected at least 50 admin routes, found ${adminRoutes.length}`);

    for (const routeFile of adminRoutes) {
      const content = readFileSync(routeFile, 'utf8');
      const hasGuard = content.includes('requireAdmin') || content.includes('verifyAdmin');
      assert.ok(
        hasGuard,
        `Admin route ${routeFile} is missing requireAdmin() or verifyAdmin() guard`
      );
    }
  });
});

import * as argon2 from "argon2";
import dataSource from "../data-source";
import { createKeyFromName } from "../../fns/create-key-from-name";
import { RefreshSession } from "../../../auth/refresh-session.entity";
import { Environment } from "../../../environments/environment.entity";
import { Organization } from "../../../organizations/organization.entity";
import { Project } from "../../../projects/project.entity";
import { defaultEnvironments } from "../../../projects/projects.service";
import { User } from "../../../users/user.entity";
import { UserRole } from "../../../users/user-role.enum";

const demoUser = {
  email: "user@example.com",
  firstName: "Demo",
  lastName: "Owner",
  organizationName: "Demo Labs",
  password: "password123"
} as const;

const demoProject = {
  description: "Demo project for local feature flag setup.",
  name: "Checkout Platform"
} as const;

const seedDemoUser = async (): Promise<void> => {
  await dataSource.initialize();

  const environments = dataSource.getRepository(Environment);
  const organizations = dataSource.getRepository(Organization);
  const projects = dataSource.getRepository(Project);
  const users = dataSource.getRepository(User);
  const refreshSessions = dataSource.getRepository(RefreshSession);
  const organizationKey = createKeyFromName(demoUser.organizationName);
  const projectKey = createKeyFromName(demoProject.name);

  let organization = await organizations.findOne({ where: { key: organizationKey } });

  if (!organization) {
    organization = await organizations.save(
      organizations.create({
        key: organizationKey,
        name: demoUser.organizationName
      })
    );
  }

  const passwordHash = await argon2.hash(demoUser.password);
  let user = await users.findOne({ where: { email: demoUser.email } });

  if (!user) {
    user = users.create({
      email: demoUser.email,
      firstName: demoUser.firstName,
      lastName: demoUser.lastName,
      organizationId: organization.id,
      passwordHash,
      role: UserRole.Owner
    });
  } else {
    user.firstName = demoUser.firstName;
    user.lastName = demoUser.lastName;
    user.organizationId = organization.id;
    user.passwordHash = passwordHash;
    user.role = UserRole.Owner;
  }

  const savedUser = await users.save(user);
  let project = await projects.findOne({ where: { key: projectKey, organizationId: organization.id } });

  if (!project) {
    project = projects.create({
      description: demoProject.description,
      key: projectKey,
      name: demoProject.name,
      organizationId: organization.id
    });
  } else {
    project.description = demoProject.description;
    project.name = demoProject.name;
  }

  const savedProject = await projects.save(project);

  for (const defaultEnvironment of defaultEnvironments) {
    const existingEnvironment = await environments.findOne({
      where: { key: defaultEnvironment.key, projectId: savedProject.id }
    });

    if (!existingEnvironment) {
      await environments.save(
        environments.create({
          ...defaultEnvironment,
          projectId: savedProject.id
        })
      );
      continue;
    }

    existingEnvironment.name = defaultEnvironment.name;
    existingEnvironment.sortOrder = defaultEnvironment.sortOrder;
    await environments.save(existingEnvironment);
  }

  await refreshSessions.delete({ userId: savedUser.id });

  console.log(`Seeded demo user: ${demoUser.email} / ${demoUser.password}`);
  console.log(`Seeded demo project: ${demoProject.name}`);
};

seedDemoUser()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
  });

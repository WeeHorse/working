CREATE OR REPLACE VIEW rich_schedules AS
  SELECT
    schedules.*, projects.name,
    projects.organisation,
    users.id AS userId,
    users.firstName,
    users.lastName,
    CONCAT(users.firstName,' ',users.lastName) AS fullName,
    CONCAT(SUBSTR(users.firstName,1,1),SUBSTR(users.lastName,1,1)) AS initials
  FROM schedules
    JOIN projects ON schedules.project = projects.id
    LEFT JOIN usersXschedules ON usersXschedules.schedule = schedules.id
    LEFT JOIN users ON usersXschedules.user = users.id AND usersXschedules.schedule = schedules.id;


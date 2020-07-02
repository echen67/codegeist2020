import ForgeUI, {
  render,
  Fragment,
  Macro,
  Text,
  Button,
  ConfigForm,
  TextField,
  Image,
  UserPicker,
  Select,
  Option,
  useConfig,
  useAction,
  useState,
  useProductContext
} from "@forge/ui";
import api from "@forge/api";

/* GET USER-SPECIFIC DATA */
// Get number of issues assigned to user
const getAssignedIssues = async (userID) => {
  const response = await api.asApp().requestJira('/rest/api/3/search', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      "Content-Type": "application/json"
    },
    body: `{
      "jql": "assignee = ${userID} ORDER BY createdDate ASC",
      "fields": [
        "*all"
      ]
    }`
  });

  if (!response.ok) {
      const err = `Error while getAssignedIssues`;
      console.error(err);
      throw new Error(err);
  }

  return await response.json();
};

// Get number of issues assigned to user that have been closed/done in the past week
const getRecentClosedIssues = async (userID) => {
  const response = await api.asApp().requestJira('/rest/api/3/search', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      "Content-Type": "application/json"
    },
    body: `{
      "jql": "assignee = ${userID} AND (status = Done AND status changed to done after -1w) OR (status = Closed AND status changed to closed after -1w) OR (status = Resolved AND status changed to Resolved after -1w)",
      "fields": [
        "summary"
      ]
    }`
  });

  if (!response.ok) {
      const err = `Error while getClosedIssues`;
      console.error(err);
      throw new Error(err);
  }

  return await response.json();
};

// Get number of issues assigned to user that are closed
const getClosedIssues = async (userID) => {
  const response = await api.asApp().requestJira('/rest/api/3/search', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      "Content-Type": "application/json"
    },
    body: `{
      "jql": "assignee = ${userID} AND (status = Closed OR status = Done OR status = Resolved)",
      "fields": [
        "summary"
      ]
    }`
  });

  if (!response.ok) {
      const err = `Error while getClosedIssues`;
      console.error(err);
      throw new Error(err);
  }

  return await response.json();
};

// Get number of overdue issues that are still open/in progress
const getOpenOverdueIssues = async (userID) => {
  const response = await api.asApp().requestJira('/rest/api/3/search', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      "Content-Type": "application/json"
    },
    body: `{
      "jql": "assignee = ${userID} AND (status != Done AND status != Closed AND status != Resolved AND duedate < now())",
      "fields": [
        "summary"
      ]
    }`
  });

  if (!response.ok) {
      const err = `Error while getOpenOverdueIssues`;
      console.error(err);
      throw new Error(err);
  }

  return await response.json();
};

// Get number of issues reported by user
const getReportedIssues = async (userID) => {
  const response = await api.asApp().requestJira('/rest/api/3/search', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      "Content-Type": "application/json"
    },
    body: `{
      "jql": "reporter = ${userID}",
      "fields": [
        "comment"
      ]
    }`
  });

  if (!response.ok) {
      const err = `Error while getReportedIssues`;
      console.error(err);
      throw new Error(err);
  }

  return await response.json();
};

// Get number of issues user is watching
const getWatchedIssues = async (userID) => {
  const response = await api.asApp().requestJira('/rest/api/3/search', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      "Content-Type": "application/json"
    },
    body: `{
      "jql": "watcher = ${userID}",
      "fields": [
        "summary"
      ]
    }`
  });

  if (!response.ok) {
      const err = `Error while getWatchedIssues`;
      console.error(err);
      throw new Error(err);
  }

  return await response.json();
};

// Get number of issues created by user
const getCreatedIssues = async (userID) => {
  const response = await api.asApp().requestJira('/rest/api/3/search', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      "Content-Type": "application/json"
    },
    body: `{
      "jql": "creator = ${userID}",
      "fields": [
        "summary"
      ]
    }`
  });

  if (!response.ok) {
      const err = `Error while getCreatedIssues`;
      console.error(err);
      throw new Error(err);
  }

  return await response.json();
};

// Get number of issues in priority by user
const getPriorityIssues = async(userID, priority) => {
  const response = await api.asApp().requestJira('/rest/api/3/search', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      "Content-Type": "application/json"
    },
    body: `{
      "jql": "assignee = ${userID} AND priority = ${priority}",
      "fields": [
        "summary"
      ]
    }`
  });

  if (!response.ok) {
      const err = `Error while getPriorityIssues`;
      console.error(err);
      throw new Error(err);
  }

  return await response.json();
};

// Get user's display name from Jira API
const getDisplayName = async (userID) => {
  const response = await api.asApp().requestJira(`/rest/api/3/user?accountId=${userID}`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json'
    }
  });

  if (!response.ok) {
      const err = `Error while getDisplayName`;
      console.error(err);
      throw new Error(err);
  }

  return await response.json();
};


/* GET GLOBAL MAX VALUES */
// Get total number of users -- query doesn't work for some reason?
const getTotalUsers = async (query) => {
  const response = await api.asApp().requestJira(`/rest/api/3/users/search?${query}`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      "Content-Type": "application/json"
    }
  });

  if (!response.ok) {
      const err = `Error while getTotalUsers`;
      console.error(err);
      throw new Error(err);
  }

  return await response.json();
};

// Get total number of issues with [PRIORITY LEVEL] (lowest, low, medium, high, highest)
const getTotalPriority = async (priority) => {
  const response = await api.asApp().requestJira('/rest/api/3/search', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      "Content-Type": "application/json"
    },
    body: `{
      "jql": "priority = ${priority}",
      "fields": [
        "summary"
      ]
    }`
  });

  if (!response.ok) {
      const err = `Error while getTotalPriority`;
      console.error(err);
      throw new Error(err);
  }

  return await response.json();
};

// Get all issues
const getTotalIssues = async () => {
  const response = await api.asApp().requestJira('/rest/api/3/search', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      "Content-Type": "application/json"
    },
    body: `{
      "jql": "ORDER BY createdDate ASC",
      "fields": [
        "comment",
        "watches",
        "priority",
        "assignee",
        "status",
        "resolutiondate",
        "duedate"
      ]
    }`
  });

  if (!response.ok) {
      const err = `Error while getAllIssues`;
      console.error(err);
      throw new Error(err);
  }

  return await response.json();
};

// Get total number of closed issues
const getTotalClosed = async () => {
  const response = await api.asApp().requestJira('/rest/api/3/search', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      "Content-Type": "application/json"
    },
    body: `{
      "jql": "status = Done OR status = Closed OR status = Resolved",
      "fields": [
        "duedate",
        "resolutiondate"
      ]
    }`
  });

  if (!response.ok) {
      const err = `Error while getTotalClosed`;
      console.error(err);
      throw new Error(err);
  }

  return await response.json();
};

// Get total number of issues closed in past week
const getTotalRecentClosed = async() => {
  const response = await api.asApp().requestJira('/rest/api/3/search', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      "Content-Type": "application/json"
    },
    body: `{
      "jql": "(status = Done AND status changed to done after -1w) OR (status = Closed AND status changed to closed after -1w) OR (status = Resolved AND status changed to Resolved after -1w)",
      "fields": [
        "assignee"
      ]
    }`
  });

  if (!response.ok) {
      const err = `Error while getTotalRecentClosed`;
      console.error(err);
      throw new Error(err);
  }

  return await response.json();
};

/* ------------------------- APP ------------------------- */
const App = () => {
  // Retrieve the configuration
  const config = useConfig();

  /* GET GLOBAL MAX VALUES */
  // Get total users
  let [totalUsers] = useAction(() => null, async () => await getTotalUsers(""));
  let numUsers = 0;
  let userName1 = "", userName2 = "";
  for (var i = 0; i < totalUsers.length; i++) {
    if (totalUsers[i].accountType == "atlassian") { numUsers += 1; }
    if (totalUsers[i].accountId == config.user1) { userName1 = totalUsers[i].displayName; }
    if (totalUsers[i].accountId == config.user2) { userName2 = totalUsers[i].displayName; }
  }

  // Get all recently closed issues
  let numRecent = 0, userRecent1 = 0, userRecent2 = 0;
  const allTotalIssues = useAction(() => null, async () => await getTotalRecentClosed());
  // console.log(allTotalIssues[0].issues[0].fields);
  for (var i = 0; i < allTotalIssues[0].issues.length; i++) {
    numRecent += 1;
    let assignee = allTotalIssues[0].issues[i].fields.assignee;
    if (assignee != null) {
      if (assignee.accountId == config.user1) { userRecent1 += 1; }
      else if (assignee.accountId == config.user2) { userRecent2 += 1; }
    }
  }

  // Get total comments, plus number of comments per user
  let numComments = 0, userComments1 = 0, userComments2 = 0;
  let numWatches = 0;
  let numClosed = 0, userClosed1 = 0, userClosed2 = 0;
  let numOnTime = 0, userOnTime1 = 0, userOnTime2 = 0;
  let numLowest = 0, numLow = 0, numMedium = 0, numHigh = 0, numHighest = 0;
  let userLowest1 = 0, userLow1 = 0, userMedium1 = 0, userHigh1 = 0, userHighest1 = 0;
  let userLowest2 = 0, userLow2 = 0, userMedium2 = 0, userHigh2 = 0, userHighest2 = 0;
  const allIssues = useAction(() => null, async () => await getTotalIssues());

  // Iterate through all issues and then through all comments on each issue
  for (var i = 0; i < allIssues[0].issues.length; i++) {
    let fields = allIssues[0].issues[i].fields;
    let priority = fields.priority.name;
    let assignee = fields.assignee;
    let comments = fields.comment.comments;
    let status = fields.status.name;
    let duedate = fields.duedate;
    let resolutiondate = fields.resolutiondate;
    // console.log(status.name);

    // Get total number of comments and per-user comment data
    numComments += comments.length;
    for (var j = 0; j < comments.length; j++) {
      if (comments[j].author.accountId == config.user1) {
        userComments1 += 1;
      } else if (comments[j].author.accountId == config.user2) {
        userComments2 += 1;
      }
    }

    // Also get total number of watches on the way
    numWatches += fields.watches.watchCount;

    // And number of issues in each priority level
    if (priority == "Lowest") { numLowest += 1; }
    else if (priority == "Low") { numLow += 1; }
    else if (priority == "Medium") { numMedium += 1; }
    else if (priority == "High") { numHigh += 1; }
    else if (priority == "Highest") { numHighest += 1; }

    // Get per-user priority data
    if (assignee != null) {
      if (priority == "Lowest" && assignee.accountId == config.user1) { userLowest1 += 1; }
      else if (priority == "Low" && assignee.accountId == config.user1) { userLow1 += 1; }
      else if (priority == "Medium" && assignee.accountId == config.user1) { userMedium1 += 1; }
      else if (priority == "High" && assignee.accountId == config.user1) { userHigh1 += 1; }
      else if (priority == "Highest" && assignee.accountId == config.user1) { userHighest1 += 1; }

      if (priority == "Lowest" && assignee.accountId == config.user2) { userLowest2 += 1; }
      else if (priority == "Low" && assignee.accountId == config.user2) { userLow2 += 1; }
      else if (priority == "Medium" && assignee.accountId == config.user2) { userMedium2 += 1; }
      else if (priority == "High" && assignee.accountId == config.user2) { userHigh2 += 1; }
      else if (priority == "Highest" && assignee.accountId == config.user2) { userHighest2 += 1; }
    }

    // Get number of closed and on-time issues
    if (status == "Done" || status == "Closed" || status == "Resolved") {
      numClosed += 1;
      if (assignee != null) {
        if (assignee.accountId == config.user1) { userClosed1 += 1; }
        else if (assignee.accountId == config.user2) { userClosed2 += 1; }
      }
      // resolutiondate != null && duedate >= resolutiondate
      if (duedate >= resolutiondate) {
        numOnTime += 1;
        if (assignee != null) {
          if (assignee.accountId == config.user1) { userOnTime1 += 1; }
          else if (assignee.accountId == config.user2) { userOnTime2 += 1; }
        }
      }
    }
  }

  // Transform to text
  const avgComments = `Average comments: ${numComments / numUsers}`;
  numComments = `Total comments: ${numComments}`;
  userComments1 = `Number of comments: ${userComments1}`;
  userComments2 = `Number of comments: ${userComments2}`;

  const avgWatches = `Average watches: ${numWatches / numUsers}`;
  numWatches = `Total watches: ${numWatches}`;
  let [userWatchedIssues1] = useAction(() => null, async () => await getWatchedIssues(config.user1));
  let [userWatchedIssues2] = useAction(() => null, async () => await getWatchedIssues(config.user2));
  userWatchedIssues1 = `Num watches: ${userWatchedIssues1.issues.length}`;
  userWatchedIssues2 = `Num watches: ${userWatchedIssues2.issues.length}`;

  const avgPriority = `Average Priority: ${(numLowest + 2*numLow + 3*numMedium + 4*numHigh + 5*numHighest) / numUsers}`;
  const totalPriority = `Total Priority: ${numLowest}, ${numLow}, ${numMedium}, ${numHigh}, ${numHighest}`;
  const userPriority1 = `Priority: [${userLowest1}, ${userLow1}, ${userMedium1}, ${userHigh1}, ${userHighest1}]: ${userLowest1 + 2*userLow1 + 3*userMedium1 + 4*userHigh1 + 5*userHighest1}`;
  const userPriority2 = `Priority: [${userLowest2}, ${userLow2}, ${userMedium2}, ${userHigh2}, ${userHighest2}]: ${userLowest2 + 2*userLow2 + 3*userMedium2 + 4*userHigh2 + 5*userHighest2}`;

  const avgDeadlines = `Average Deadlines: ${numOnTime / numClosed}`;
  const userDeadlines1 = `Met Deadlines: ${userOnTime1 / userClosed1}`;
  const userDeadlines2 = `Met Deadlines: ${userOnTime2 / userClosed2}`;
  numClosed = `Total closed issues: ${numClosed}`;
  userClosed1 = `Number of closed issues: ${userClosed1}`;
  userClosed2 = `Number of closed issues: ${userClosed2}`;
  numOnTime = `Total on-time issues: ${numOnTime}`;
  userOnTime1 = `Number of on-time issues: ${userOnTime1}`;
  userOnTime2 = `Number of on-time issues: ${userOnTime2}`;

  const avgProductivity = `Average Productivity: ${numRecent / numUsers}`;
  numRecent = `Total Recent: ${numRecent}`;
  userRecent1 = `Recent: ${userRecent1}`;
  userRecent2 = `Recent: ${userRecent2}`;

  numUsers = `Total users: ${numUsers}`;
  userName1 = `User 1: ${userName1}`;
  userName2 = `User 2: ${userName2}`;


  /* ------------------------- DRAW RADAR CHART ------------------------- */
  const radius = 250;

  // Draw the circles making up the base of the radar chart
  const circle =
    `<circle
        cx="${radius}"
        cy="${radius}"
        r="${radius}"
        fill="#FAFAFA"
        stroke="#999"
        stroke-width=".2"
    />
    <circle
        cx="${radius}"
        cy="${radius}"
        r="${.75*radius}"
        fill="#FAFAFA"
        stroke="#999"
        stroke-width=".2"
    />
    <circle
        cx="${radius}"
        cy="${radius}"
        r="${.5*radius}"
        fill="#FAFAFA"
        stroke="#999"
        stroke-width=".2"
    />
    <circle
        cx="${radius}"
        cy="${radius}"
        r="${.25*radius}"
        fill="#FAFAFA"
        stroke="#999"
        stroke-width=".2"
    />`;

  // Lines radiating out from center
  // Angles: 18, 90, 162, 234, 306
  const line =
    `<line
      x1="${radius}"
      y1="${radius}"
      x2="488"
      y2="327"
      style="stroke:#999;stroke-width:0.3"
    />
    <line
      x1="${radius}"
      y1="${radius}"
      x2="250"
      y2="500"
      style="stroke:#999;stroke-width:0.3"
    />
    <line
      x1="${radius}"
      y1="${radius}"
      x2="12"
      y2="327"
      style="stroke:#999;stroke-width:0.3"
    />
    <line
      x1="${radius}"
      y1="${radius}"
      x2="103"
      y2="48"
      style="stroke:#999;stroke-width:0.3"
    />
    <line
      x1="${radius}"
      y1="${radius}"
      x2="397"
      y2="48"
      style="stroke:#999;stroke-width:0.3"
    />`;

  // Transform polar coordinate to cartesian
  // Use to transform skill rating [0-1] to point on radar chart
  // p: the skill rating, [0-1]
  // theta: the angle in degrees, [18, 90, 162, 234, 306]
  const polarCartesian = (p, theta) => {
    const rad = theta * (Math.PI/180);
    const x = radius * p * Math.cos(rad) + radius;
    const y = radius * p * Math.sin(rad) + radius;
    return {x:x, y:y};
  };

  // convert skill ratings to chart points
  const communication = polarCartesian(config.communication, 18);
  const technical = polarCartesian(config.technical, 90);
  const leadership = polarCartesian(config.leadership, 162);
  const teamwork = polarCartesian(config.teamwork, 234);
  const deadlines = polarCartesian(config.deadlines, 306);

  // Polygon showing users skills for each dimension
  // Angles: 18, 90, 162, 234, 306
  const poly =
    `<polygon
      points="${communication.x},${communication.y} ${technical.x},${technical.y} ${leadership.x},${leadership.y} ${teamwork.x},${teamwork.y} ${deadlines.x},${deadlines.y}"
      style="fill:#5D1D1D;stroke:#5D1D1D;stroke-width:1;opacity:0.3;"
    />`;

  // Second user's polygon
  const communication2 = polarCartesian(config.communication2, 18);
  const technical2 = polarCartesian(config.technical2, 90);
  const leadership2 = polarCartesian(config.leadership2, 162);
  const teamwork2 = polarCartesian(config.teamwork2, 234);
  const deadlines2 = polarCartesian(config.deadlines2, 306);

  const poly2 =
    `<polygon
      points="${communication2.x},${communication2.y} ${technical2.x},${technical2.y} ${leadership2.x},${leadership2.y} ${teamwork2.x},${teamwork2.y} ${deadlines2.x},${deadlines2.y}"
      style="fill:#28305C;stroke:#28305C;stroke-width:1;opacity:0.3;"
    />`;

  // Labels for each dimension
  const caption =
    `<text x="495" y="327" fill="#777" >Communication</text>
    <text x="190" y="520" fill="#777" >Technical Knowledge</text>
    <text x="0" y="327" fill="#777" >Leadership</text>
    <text x="70" y="40" fill="#777" >Teamwork</text>
    <text x="399" y="45" fill="#777" >Meeting Deadlines</text>`;

  // Combine all elements for the final svg
  const svg = `<svg xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 ${radius*2+100} ${radius*2+100}"
                  width="${radius*2}"
                  height="${radius*2}"
                >` + `<g>` + circle + line + poly + poly2 + caption + `</g>` + `</svg>`;

  // Use the configuration values
  return (
    <Fragment>
      <Text content={numUsers} />
      <Text content={numComments} />
      <Text content={numWatches} />
      <Text content={totalPriority} />
      <Text content={numClosed} />
      <Text content={numOnTime} />
      <Text content={numRecent} />

      <Text content={avgComments} />
      <Text content={avgWatches} />
      <Text content={avgPriority} />
      <Text content={avgDeadlines} />
      <Text content={avgProductivity} />

      <Text content={userName1} />
      <Text content={userComments1} />
      <Text content={userWatchedIssues1} />
      <Text content={userPriority1} />
      <Text content={userClosed1} />
      <Text content={userOnTime1} />
      <Text content={userDeadlines1} />
      <Text content={userRecent1} />

      <Text content={userName2} />
      <Text content={userComments2} />
      <Text content={userWatchedIssues2} />
      <Text content={userPriority2} />
      <Text content={userClosed2} />
      <Text content={userOnTime2} />
      <Text content={userDeadlines2} />
      <Text content={userRecent2} />

      <Image
        src={`data:image/svg+xml;utf8,${encodeURIComponent(svg)}`}
        alt='Radar chart'
      />
    </Fragment>
  );
};

// Function that defines the configuration UI
// This is the modal that pops up when you edit the macro
const Config = () => {
  return (
    <ConfigForm>
      <UserPicker label="User" name="user1" />
      <Select label="Communication" name="communication">
        <Option defaultSelected label="1" value="0.1" />
        <Option label="2" value="0.2" />
        <Option label="3" value="0.3" />
        <Option label="4" value="0.4" />
        <Option label="5" value="0.5" />
        <Option label="6" value="0.6" />
        <Option label="7" value="0.7" />
        <Option label="8" value="0.8" />
        <Option label="9" value="0.9" />
        <Option label="10" value="1" />
      </Select>
      <Select label="Technical Knowledge" name="technical">
        <Option defaultSelected label="1" value="0.1" />
        <Option label="2" value="0.2" />
        <Option label="3" value="0.3" />
        <Option label="4" value="0.4" />
        <Option label="5" value="0.5" />
        <Option label="6" value="0.6" />
        <Option label="7" value="0.7" />
        <Option label="8" value="0.8" />
        <Option label="9" value="0.9" />
        <Option label="10" value="1" />
      </Select>
      <Select label="Leadership" name="leadership">
        <Option defaultSelected label="1" value="0.1" />
        <Option label="2" value="0.2" />
        <Option label="3" value="0.3" />
        <Option label="4" value="0.4" />
        <Option label="5" value="0.5" />
        <Option label="6" value="0.6" />
        <Option label="7" value="0.7" />
        <Option label="8" value="0.8" />
        <Option label="9" value="0.9" />
        <Option label="10" value="1" />
      </Select>
      <Select label="Teamwork" name="teamwork">
        <Option defaultSelected label="1" value="0.1" />
        <Option label="2" value="0.2" />
        <Option label="3" value="0.3" />
        <Option label="4" value="0.4" />
        <Option label="5" value="0.5" />
        <Option label="6" value="0.6" />
        <Option label="7" value="0.7" />
        <Option label="8" value="0.8" />
        <Option label="9" value="0.9" />
        <Option label="10" value="1" />
      </Select>
      <Select label="Meeting Deadlines" name="deadlines">
        <Option defaultSelected label="1" value="0.1" />
        <Option label="2" value="0.2" />
        <Option label="3" value="0.3" />
        <Option label="4" value="0.4" />
        <Option label="5" value="0.5" />
        <Option label="6" value="0.6" />
        <Option label="7" value="0.7" />
        <Option label="8" value="0.8" />
        <Option label="9" value="0.9" />
        <Option label="10" value="1" />
      </Select>

      <UserPicker label="User" name="user2" />
      <Select label="Communication" name="communication2">
        <Option defaultSelected label="1" value="0.1" />
        <Option label="2" value="0.2" />
        <Option label="3" value="0.3" />
        <Option label="4" value="0.4" />
        <Option label="5" value="0.5" />
        <Option label="6" value="0.6" />
        <Option label="7" value="0.7" />
        <Option label="8" value="0.8" />
        <Option label="9" value="0.9" />
        <Option label="10" value="1" />
      </Select>
      <Select label="Technical Knowledge" name="technical2">
        <Option defaultSelected label="1" value="0.1" />
        <Option label="2" value="0.2" />
        <Option label="3" value="0.3" />
        <Option label="4" value="0.4" />
        <Option label="5" value="0.5" />
        <Option label="6" value="0.6" />
        <Option label="7" value="0.7" />
        <Option label="8" value="0.8" />
        <Option label="9" value="0.9" />
        <Option label="10" value="1" />
      </Select>
      <Select label="Leadership" name="leadership2">
        <Option defaultSelected label="1" value="0.1" />
        <Option label="2" value="0.2" />
        <Option label="3" value="0.3" />
        <Option label="4" value="0.4" />
        <Option label="5" value="0.5" />
        <Option label="6" value="0.6" />
        <Option label="7" value="0.7" />
        <Option label="8" value="0.8" />
        <Option label="9" value="0.9" />
        <Option label="10" value="1" />
      </Select>
      <Select label="Teamwork" name="teamwork2">
        <Option defaultSelected label="1" value="0.1" />
        <Option label="2" value="0.2" />
        <Option label="3" value="0.3" />
        <Option label="4" value="0.4" />
        <Option label="5" value="0.5" />
        <Option label="6" value="0.6" />
        <Option label="7" value="0.7" />
        <Option label="8" value="0.8" />
        <Option label="9" value="0.9" />
        <Option label="10" value="1" />
      </Select>
      <Select label="Meeting Deadlines" name="deadlines2">
        <Option defaultSelected label="1" value="0.1" />
        <Option label="2" value="0.2" />
        <Option label="3" value="0.3" />
        <Option label="4" value="0.4" />
        <Option label="5" value="0.5" />
        <Option label="6" value="0.6" />
        <Option label="7" value="0.7" />
        <Option label="8" value="0.8" />
        <Option label="9" value="0.9" />
        <Option label="10" value="1" />
      </Select>
    </ConfigForm>
  );
};

// A macro containing props for the app code, configuration,
// and default configuration values.
export const run = render(
  <Macro
    app={<App />}
    config={<Config />}
    defaultConfig={{
      communication: "0.1",
      technical: "0.1",
      leadership: "0.1",
      teamwork: "0.1",
      deadlines: "0.1",
      communication2: "0.1",
      technical2: "0.1",
      leadership2: "0.1",
      teamwork2: "0.1",
      deadlines2: "0.1"
    }}
  />
);

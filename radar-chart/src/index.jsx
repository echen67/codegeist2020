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
/**
 * Get number of issues user is watching.
 * @param {String} userID   The account id of the user.
 * @return {JSON} Return JSON containing all issues user is watching.
**/
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
  const userConfig = [config.user1, config.user2, config.user3, config.user4, config.user5];

  /* GET GLOBAL MAX VALUES */
  // Get total users
  let [totalUsers] = useAction(() => null, async () => await getTotalUsers(""));
  let numUsers = 0;
  let userNames = ["", "", "", "", ""];
  for (var i = 0; i < totalUsers.length; i++) {
    if (totalUsers[i].accountType == "atlassian") { numUsers += 1; }
    for (var j = 0; j < userConfig.length; j++) {
      if (totalUsers[i].accountId == userConfig[j]) { userNames[j] = totalUsers[i].displayName; }
    }
  }

  // Get all recently closed issues
  let numRecent = 0;
  let userRecents = [0, 0, 0, 0, 0];
  const allRecentIssues = useAction(() => null, async () => await getTotalRecentClosed());
  for (var i = 0; i < allRecentIssues[0].issues.length; i++) {
    numRecent += 1;
    let assignee = allRecentIssues[0].issues[i].fields.assignee;
    if (assignee != null) {
      for (var j = 0; j < userRecents.length; j++) {
        if (assignee.accountId == userConfig[j]) { userRecents[j] += 1; }
      }
    }
  }

  // Get total comments, plus number of comments per user
  let numComments = 0, numWatches = 0, numClosed = 0, numOnTime = 0;
  let userComments = [0, 0, 0, 0, 0], userClosed = [0, 0, 0, 0, 0], userOnTime = [0, 0, 0, 0, 0];
  let numLowest = 0, numLow = 0, numMedium = 0, numHigh = 0, numHighest = 0;
  let userPriorities = [[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0]];
  const priorities = ["Lowest", "Low", "Medium", "High", "Highest"];
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

    // Get total number of comments and per-user comment data
    numComments += comments.length;
    for (var j = 0; j < comments.length; j++) {
      for (var k = 0; k < userConfig.length; k++) {
        if (comments[j].author.accountId == userConfig[k]) { userComments[k] += 1; }
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
      for (var j = 0; j < userConfig.length; j++) {
        for (var k = 0; k < priorities.length; k++) {
          if (assignee.accountId == userConfig[j] && priority == priorities[k]) {
            userPriorities[j][k] += 1;
          }
        }
      }
    }

    // Get number of closed and on-time issues
    if (status == "Done" || status == "Closed" || status == "Resolved") {
      numClosed += 1;
      if (assignee != null) {
        for (var j = 0; j < userConfig.length; j++) {
          if (assignee.accountId == userConfig[j]) { userClosed[j] += 1; }
        }
      }
      // resolutiondate != null && duedate >= resolutiondate
      if (duedate == null || duedate >= resolutiondate) {
        numOnTime += 1;
        if (assignee != null) {
          for (var j = 0; j < userConfig.length; j++) {
            if (assignee.accountId == userConfig[j]) { userOnTime[j] += 1; }
          }
        }
      }
    }
  }

  // Transform to chart data
  let [userWatchedIssues1] = useAction(() => null, async () => await getWatchedIssues(config.user1));
  let [userWatchedIssues2] = useAction(() => null, async () => await getWatchedIssues(config.user2));
  let [userWatchedIssues3] = useAction(() => null, async () => await getWatchedIssues(config.user3));
  let [userWatchedIssues4] = useAction(() => null, async () => await getWatchedIssues(config.user4));
  let [userWatchedIssues5] = useAction(() => null, async () => await getWatchedIssues(config.user5));
  const userP1 = userPriorities[0][0] + 2*userPriorities[0][1] + 3*userPriorities[0][2] + 4*userPriorities[0][3] + 5*userPriorities[0][4];
  const userP2 = userPriorities[1][0] + 2*userPriorities[1][1] + 3*userPriorities[1][2] + 4*userPriorities[1][3] + 5*userPriorities[1][4];
  const userP3 = userPriorities[2][0] + 2*userPriorities[2][1] + 3*userPriorities[2][2] + 4*userPriorities[2][3] + 5*userPriorities[2][4];
  const userP4 = userPriorities[3][0] + 2*userPriorities[3][1] + 3*userPriorities[3][2] + 4*userPriorities[3][3] + 5*userPriorities[3][4];
  const userP5 = userPriorities[4][0] + 2*userPriorities[4][1] + 3*userPriorities[4][2] + 4*userPriorities[4][3] + 5*userPriorities[4][4];
  const avgCommunication = numComments / numUsers;
  const avgInvolvement = numWatches / numUsers;
  const avgPriority = (numLowest + 2*numLow + 3*numMedium + 4*numHigh + 5*numHighest) / numUsers;
  const avgDeadlines = numOnTime / numClosed;
  const avgProductivity = numRecent / numUsers;

  let communicationUser1 = (avgCommunication != 0) ? (userComments[0] / avgCommunication) : 0;
  let involvementUser1 = (avgInvolvement != 0) ? (userWatchedIssues1.issues.length / avgInvolvement) : 0;
  let technicalUser1 = (avgPriority != 0) ? (userP1 / avgPriority) : 0;
  let deadlinesUser1 = (avgDeadlines != 0) ? ((userOnTime[0] / userClosed[0]) / avgDeadlines) : 0;
  let productivityUser1 = (avgProductivity != 0) ? (userRecents[0] / avgProductivity) : 0;
  const max1 = Math.max(communicationUser1, involvementUser1, technicalUser1, deadlinesUser1, productivityUser1);
  if (max1 != 0) {
    communicationUser1 /= max1;
    involvementUser1 /= max1;
    technicalUser1 /= max1;
    deadlinesUser1 /= max1;
    productivityUser1 /= max1;
  }

  let communicationUser2 = (avgCommunication != 0) ? (userComments[1] / avgCommunication) : 0;
  let involvementUser2 = (avgInvolvement != 0) ? (userWatchedIssues2.issues.length / avgInvolvement) : 0;
  let technicalUser2 = (avgPriority != 0) ? (userP2 / avgPriority) : 0;
  let deadlinesUser2 = (avgDeadlines != 0) ? ((userOnTime[1] / userClosed[1]) / avgDeadlines) : 0;
  let productivityUser2 = (avgProductivity != 0) ? (userRecents[1] / avgProductivity) : 0;
  const max2 = Math.max(communicationUser2, involvementUser2, technicalUser2, deadlinesUser2, productivityUser2);
  if (max2 != 0) {
    communicationUser2 /= max2;
    involvementUser2 /= max2;
    technicalUser2 /= max2;
    deadlinesUser2 /= max2;
    productivityUser2 /= max2;
  }

  let communicationUser3 = (avgCommunication != 0) ? (userComments[2] / avgCommunication) : 0;
  let involvementUser3 = (avgInvolvement != 0) ? (userWatchedIssues3.issues.length / avgInvolvement) : 0;
  let technicalUser3 = (avgPriority != 0) ? (userP3 / avgPriority) : 0;
  let deadlinesUser3 = (avgDeadlines != 0) ? ((userOnTime[2] / userClosed[2]) / avgDeadlines) : 0;
  let productivityUser3 = (avgProductivity != 0) ? (userRecents[2] / avgProductivity) : 0;
  const max3 = Math.max(communicationUser3, involvementUser3, technicalUser3, deadlinesUser3, productivityUser3);
  if (max3 != 0) {
    communicationUser3 /= max3;
    involvementUser3 /= max3;
    technicalUser3 /= max3;
    deadlinesUser3 /= max3;
    productivityUser3 /= max3;
  }

  let communicationUser4 = (avgCommunication != 0) ? (userComments[3] / avgCommunication) : 0;
  let involvementUser4 = (avgInvolvement != 0) ? (userWatchedIssues4.issues.length / avgInvolvement) : 0;
  let technicalUser4 = (avgPriority != 0) ? (userP4 / avgPriority) : 0;
  let deadlinesUser4 = (avgDeadlines != 0) ? ((userOnTime[3] / userClosed[3]) / avgDeadlines) : 0;
  let productivityUser4 = (avgProductivity != 0) ? (userRecents[3] / avgProductivity) : 0;
  const max4 = Math.max(communicationUser4, involvementUser4, technicalUser4, deadlinesUser4, productivityUser4);
  if (max4 != 0) {
    communicationUser4 /= max4;
    involvementUser4 /= max4;
    technicalUser4 /= max4;
    deadlinesUser4 /= max4;
    productivityUser4 /= max4;
  }

  let communicationUser5 = (avgCommunication != 0) ? (userComments[4] / avgCommunication) : 0;
  let involvementUser5 = (avgInvolvement != 0) ? (userWatchedIssues5.issues.length / avgInvolvement) : 0;
  let technicalUser5 = (avgPriority != 0) ? (userP5 / avgPriority) : 0;
  let deadlinesUser5 = (avgDeadlines != 0) ? ((userOnTime[4] / userClosed[4]) / avgDeadlines) : 0;
  let productivityUser5 = (avgProductivity != 0) ? (userRecents[4] / avgProductivity) : 0;
  const max5 = Math.max(communicationUser5, involvementUser5, technicalUser5, deadlinesUser5, productivityUser5);
  if (max5 != 0) {
    communicationUser5 /= max5;
    involvementUser5 /= max5;
    technicalUser5 /= max5;
    deadlinesUser5 /= max5;
    productivityUser5 /= max5;
  }

  // Transform to text (remove in final version)
  const userComments1 = `Comments: ${userComments[0]}, Communication: ${userComments[0] / avgCommunication}`;
  const userComments2 = `Comments: ${userComments[1]}, Communication: ${userComments[1] / avgCommunication}`;
  numComments = `Total comments: ${numComments}, Average comments: ${avgCommunication}`;

  userWatchedIssues1 = `Watches: ${userWatchedIssues1.issues.length}, Involvement: ${userWatchedIssues1.issues.length / avgInvolvement}`;
  userWatchedIssues2 = `Watches: ${userWatchedIssues2.issues.length}, Involvement: ${userWatchedIssues2.issues.length / avgInvolvement}`;
  numWatches = `Total watches: ${numWatches}, Average watches: ${avgInvolvement}`;

  const userPriority1 = `Priority: [${userPriorities[0]}]: ${userP1}, Technical: ${userP1 / avgPriority}`;
  const userPriority2 = `Priority: [${userPriorities[1]}]: ${userP2}, Technical: ${userP2 / avgPriority}`;
  const totalPriority = `Total Priority: ${numLowest}, ${numLow}, ${numMedium}, ${numHigh}, ${numHighest}, Average Priority: ${avgPriority}`;

  const userClosed1 = `Closed issues: ${userClosed[0]}, On-time issues: ${userOnTime[0]}, Met Deadlines: ${userOnTime[0] / userClosed[0]}, Deadlines: ${(userOnTime[0] / userClosed[0]) / avgDeadlines}`;
  const userClosed2 = `Closed issues: ${userClosed[1]}, On-time issues: ${userOnTime[1]}, Met Deadlines: ${userOnTime[1] / userClosed[1]}, Deadlines: ${(userOnTime[1] / userClosed[1]) / avgDeadlines}`;
  numClosed = `Total closed issues: ${numClosed}, Total on-time issues: ${numOnTime}, Average On-Time: ${avgDeadlines}`;

  const userRecent1 = `Recently Closed: ${userRecents[0]}, Productivity: ${userRecents[0] / avgProductivity}`;
  const userRecent2 = `Recently Closed: ${userRecents[1]}, Productivity: ${userRecents[1] / avgProductivity}`;
  numRecent = `Total Recent: ${numRecent}, Average Recent: ${avgProductivity}`;

  numUsers = `Total users: ${numUsers}`;
  const userName1 = `User 1: ${userNames[0]}`;
  const userName2 = `User 2: ${userNames[1]}`;


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
  const communication1 = polarCartesian(communicationUser1, 18);
  const involvement1 = polarCartesian(involvementUser1, 90);
  const technical1 = polarCartesian(technicalUser1, 162);
  const deadlines1 = polarCartesian(deadlinesUser1, 234);
  const productivity1 = polarCartesian(productivityUser1, 306);
  // Polygon showing users skills for each dimension
  // Angles: 18, 90, 162, 234, 306
  const poly =
    `<polygon
      points="${communication1.x},${communication1.y} ${involvement1.x},${involvement1.y} ${technical1.x},${technical1.y} ${deadlines1.x},${deadlines1.y} ${productivity1.x},${productivity1.y}"
      style="fill:#5D1D1D;stroke:#5D1D1D;stroke-width:1;opacity:0.3;"
    />`;

  // Second user's polygon
  const communication2 = polarCartesian(communicationUser2, 18);
  const involvement2 = polarCartesian(involvementUser2, 90);
  const technical2 = polarCartesian(technicalUser2, 162);
  const deadlines2 = polarCartesian(deadlinesUser2, 234);
  const productivity2 = polarCartesian(productivityUser2, 306);
  const poly2 =
    `<polygon
      points="${communication2.x},${communication2.y} ${involvement2.x},${involvement2.y} ${technical2.x},${technical2.y} ${deadlines2.x},${deadlines2.y} ${productivity2.x},${productivity2.y}"
      style="fill:#28305C;stroke:#28305C;stroke-width:1;opacity:0.3;"
    />`;

  // Third poly
  const communication3 = polarCartesian(communicationUser3, 18);
  const involvement3 = polarCartesian(involvementUser3, 90);
  const technical3 = polarCartesian(technicalUser3, 162);
  const deadlines3 = polarCartesian(deadlinesUser3, 234);
  const productivity3 = polarCartesian(productivityUser3, 306);
  const poly3 =
    `<polygon
      points="${communication3.x},${communication3.y} ${involvement3.x},${involvement3.y} ${technical3.x},${technical3.y} ${deadlines3.x},${deadlines3.y} ${productivity3.x},${productivity3.y}"
      style="fill:#1B7344;stroke:#1B7344;stroke-width:1;opacity:0.3;"
    />`;

  // fourth poly
  const communication4 = polarCartesian(communicationUser4, 18);
  const involvement4 = polarCartesian(involvementUser4, 90);
  const technical4 = polarCartesian(technicalUser4, 162);
  const deadlines4 = polarCartesian(deadlinesUser4, 234);
  const productivity4 = polarCartesian(productivityUser4, 306);
  const poly4 =
    `<polygon
      points="${communication4.x},${communication4.y} ${involvement4.x},${involvement4.y} ${technical4.x},${technical4.y} ${deadlines4.x},${deadlines4.y} ${productivity4.x},${productivity4.y}"
      style="fill:#6F39AD;stroke:#6F39AD;stroke-width:1;opacity:0.3;"
    />`;

  // fifth poly
  const communication5 = polarCartesian(communicationUser5, 18);
  const involvement5 = polarCartesian(involvementUser5, 90);
  const technical5 = polarCartesian(technicalUser5, 162);
  const deadlines5 = polarCartesian(deadlinesUser5, 234);
  const productivity5 = polarCartesian(productivityUser5, 306);
  const poly5 =
    `<polygon
      points="${communication5.x},${communication5.y} ${involvement5.x},${involvement5.y} ${technical5.x},${technical5.y} ${deadlines5.x},${deadlines5.y} ${productivity5.x},${productivity5.y}"
      style="fill:#1A8584;stroke:#1A8584;stroke-width:1;opacity:0.3;"
    />`;

  // Labels for each dimension
  const caption =
    `<text x="495" y="327" fill="#777" >Communication</text>
    <text x="225" y="520" fill="#777" >Involvement</text>
    <text x="0" y="327" fill="#777" >Technical</text>
    <text x="50" y="30" fill="#777" >Meeting Deadlines</text>
    <text x="399" y="45" fill="#777" >Productivity</text>`;

  // Combine all elements for the final svg
  const svg = `<svg xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 ${radius*2+100} ${radius*2+100}"
                  width="${radius*2}"
                  height="${radius*2}"
                >` + `<g>` + circle + line + poly + poly2 + poly3 + poly4 + poly5 + caption + `</g>` + `</svg>`;

  // Use the configuration values
  return (
    <Fragment>
      <Text content={numUsers} />
      <Text content={numComments} />
      <Text content={numWatches} />
      <Text content={totalPriority} />
      <Text content={numClosed} />
      <Text content={numRecent} />

      <Text content={userName1} />
      <Text content={userComments1} />
      <Text content={userWatchedIssues1} />
      <Text content={userPriority1} />
      <Text content={userClosed1} />
      <Text content={userRecent1} />

      <Text content={userName2} />
      <Text content={userComments2} />
      <Text content={userWatchedIssues2} />
      <Text content={userPriority2} />
      <Text content={userClosed2} />
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
      <UserPicker label="User" name="user2" />
      <UserPicker label="User" name="user3" />
      <UserPicker label="User" name="user4" />
      <UserPicker label="User" name="user5" />
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
    }}
  />
);

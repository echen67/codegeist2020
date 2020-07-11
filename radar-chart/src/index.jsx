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

  /* GET GLOBAL MAX VALUES */
  // Get total users
  let [totalUsers] = useAction(() => null, async () => await getTotalUsers(""));
  let numUsers = 0;
  let userName1 = "", userName2 = "", userName3 = "", userName4 = "", userName5 = "";
  let userNames = ["", "", "", "", ""];
  for (var i = 0; i < totalUsers.length; i++) {
    if (totalUsers[i].accountType == "atlassian") { numUsers += 1; }
    if (totalUsers[i].accountId == config.user1) { userName1 = totalUsers[i].displayName; }
    if (totalUsers[i].accountId == config.user2) { userName2 = totalUsers[i].displayName; }
    if (totalUsers[i].accountId == config.user3) { userName3 = totalUsers[i].displayName; }
    if (totalUsers[i].accountId == config.user4) { userName4 = totalUsers[i].displayName; }
    if (totalUsers[i].accountId == config.user5) { userName5 = totalUsers[i].displayName; }
  }

  // Get all recently closed issues
  let numRecent = 0, userRecent1 = 0, userRecent2 = 0, userRecent3 = 0, userRecent4 = 0, userRecent5 = 0;
  const allRecentIssues = useAction(() => null, async () => await getTotalRecentClosed());
  for (var i = 0; i < allRecentIssues[0].issues.length; i++) {
    numRecent += 1;
    let assignee = allRecentIssues[0].issues[i].fields.assignee;
    if (assignee != null) {
      if (assignee.accountId == config.user1) { userRecent1 += 1; }
      else if (assignee.accountId == config.user2) { userRecent2 += 1; }
      else if (assignee.accountId == config.user3) { userRecent3 += 1; }
      else if (assignee.accountId == config.user4) { userRecent4 += 1; }
      else if (assignee.accountId == config.user5) { userRecent5 += 1; }
    }
  }

  // Get total comments, plus number of comments per user
  let numComments = 0, userComments1 = 0, userComments2 = 0, userComments3 = 0, userComments4 = 0, userComments5 = 0;
  let numWatches = 0;
  let numClosed = 0, userClosed1 = 0, userClosed2 = 0, userClosed3 = 0, userClosed4 = 0, userClosed5 = 0;
  let numOnTime = 0, userOnTime1 = 0, userOnTime2 = 0, userOnTime3 = 0, userOnTime4 = 0, userOnTime5 = 0;
  let numLowest = 0, numLow = 0, numMedium = 0, numHigh = 0, numHighest = 0;
  let userLowest1 = 0, userLow1 = 0, userMedium1 = 0, userHigh1 = 0, userHighest1 = 0;
  let userLowest2 = 0, userLow2 = 0, userMedium2 = 0, userHigh2 = 0, userHighest2 = 0;
  let userLowest3 = 0, userLow3 = 0, userMedium3 = 0, userHigh3 = 0, userHighest3 = 0;
  let userLowest4 = 0, userLow4 = 0, userMedium4 = 0, userHigh4 = 0, userHighest4 = 0;
  let userLowest5 = 0, userLow5 = 0, userMedium5 = 0, userHigh5 = 0, userHighest5 = 0;
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
      if (comments[j].author.accountId == config.user1) { userComments1 += 1; }
      else if (comments[j].author.accountId == config.user2) { userComments2 += 1; }
      else if (comments[j].author.accountId == config.user3) { userComments3 += 1; }
      else if (comments[j].author.accountId == config.user4) { userComments4 += 1; }
      else if (comments[j].author.accountId == config.user5) { userComments5 += 1; }
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
      if (assignee.accountId == config.user1) {
        if (priority == "Lowest") { userLowest1 += 1; }
        else if (priority == "Low") { userLow1 += 1; }
        else if (priority == "Medium") { userMedium1 += 1; }
        else if (priority == "High") { userHigh1 += 1; }
        else if (priority == "Highest") { userHighest1 += 1; }
      }

      if (assignee.accountId == config.user2) {
        if (priority == "Lowest") { userLowest2 += 1; }
        else if (priority == "Low") { userLow2 += 1; }
        else if (priority == "Medium") { userMedium2 += 1; }
        else if (priority == "High") { userHigh2 += 1; }
        else if (priority == "Highest") { userHighest2 += 1; }
      }

      if (assignee.accountId == config.user3) {
        if (priority == "Lowest") { userLowest3 += 1; }
        else if (priority == "Low") { userLow3 += 1; }
        else if (priority == "Medium") { userMedium3 += 1; }
        else if (priority == "High") { userHigh3 += 1; }
        else if (priority == "Highest") { userHighest3 += 1; }
      }

      if (assignee.accountId == config.user4) {
        if (priority == "Lowest") { userLowest4 += 1; }
        else if (priority == "Low") { userLow4 += 1; }
        else if (priority == "Medium") { userMedium4 += 1; }
        else if (priority == "High") { userHigh4 += 1; }
        else if (priority == "Highest") { userHighest4 += 1; }
      }

      if (assignee.accountId == config.user5) {
        if (priority == "Lowest") { userLowest5 += 1; }
        else if (priority == "Low") { userLow5 += 1; }
        else if (priority == "Medium") { userMedium5 += 1; }
        else if (priority == "High") { userHigh5 += 1; }
        else if (priority == "Highest") { userHighest5 += 1; }
      }
    }

    // Get number of closed and on-time issues
    if (status == "Done" || status == "Closed" || status == "Resolved") {
      numClosed += 1;
      if (assignee != null) {
        if (assignee.accountId == config.user1) { userClosed1 += 1; }
        else if (assignee.accountId == config.user2) { userClosed2 += 1; }
        else if (assignee.accountId == config.user3) { userClosed3 += 1; }
        else if (assignee.accountId == config.user4) { userClosed4 += 1; }
        else if (assignee.accountId == config.user5) { userClosed5 += 1; }
      }
      // resolutiondate != null && duedate >= resolutiondate
      if (duedate == null || duedate >= resolutiondate) {
        numOnTime += 1;
        if (assignee != null) {
          if (assignee.accountId == config.user1) { userOnTime1 += 1; }
          else if (assignee.accountId == config.user2) { userOnTime2 += 1; }
          else if (assignee.accountId == config.user3) { userOnTime3 += 1; }
          else if (assignee.accountId == config.user4) { userOnTime4 += 1; }
          else if (assignee.accountId == config.user5) { userOnTime5 += 1; }
        }
      }
    }
  }

  // Transform to chart data
  let [userWatchedIssues1] = useAction(() => null, async () => await getWatchedIssues(config.user1));
  let [userWatchedIssues2] = useAction(() => null, async () => await getWatchedIssues(config.user2));
  const userP1 = userLowest1 + 2*userLow1 + 3*userMedium1 + 4*userHigh1 + 5*userHighest1;
  const userP2 = userLowest2 + 2*userLow2 + 3*userMedium2 + 4*userHigh2 + 5*userHighest2;
  const avgCommunication = numComments / numUsers;
  const avgInvolvement = numWatches / numUsers;
  const avgPriority = (numLowest + 2*numLow + 3*numMedium + 4*numHigh + 5*numHighest) / numUsers;
  const avgDeadlines = numOnTime / numClosed;
  const avgProductivity = numRecent / numUsers;

  let communicationUser1 = (avgCommunication != 0) ? (userComments1 / avgCommunication) : 0;
  let involvementUser1 = (avgInvolvement != 0) ? (userWatchedIssues1.issues.length / avgInvolvement) : 0;
  let technicalUser1 = (avgPriority != 0) ? (userP1 / avgPriority) : 0;
  let deadlinesUser1 = (avgDeadlines != 0) ? ((userOnTime1 / userClosed1) / avgDeadlines) : 0;
  let productivityUser1 = (avgProductivity != 0) ? (userRecent1 / avgProductivity) : 0;
  const max1 = Math.max(communicationUser1, involvementUser1, technicalUser1, deadlinesUser1, productivityUser1);
  if (max1 != 0) {
    communicationUser1 /= max1;
    involvementUser1 /= max1;
    technicalUser1 /= max1;
    deadlinesUser1 /= max1;
    productivityUser1 /= max1;
  }

  let communicationUser2 = (avgCommunication != 0) ? (userComments2 / avgCommunication) : 0;
  let involvementUser2 = (avgInvolvement != 0) ? (userWatchedIssues2.issues.length / avgInvolvement) : 0;
  let technicalUser2 = (avgPriority != 0) ? (userP2 / avgPriority) : 0;
  let deadlinesUser2 = (avgDeadlines != 0) ? ((userOnTime2 / userClosed2) / avgDeadlines) : 0;
  let productivityUser2 = (avgProductivity != 0) ? (userRecent2 / avgProductivity) : 0;
  const max2 = Math.max(communicationUser2, involvementUser2, technicalUser2, deadlinesUser2, productivityUser2);
  if (max2 != 0) {
    communicationUser2 /= max2;
    involvementUser2 /= max2;
    technicalUser2 /= max2;
    deadlinesUser2 /= max2;
    productivityUser2 /= max2;
  }

  // Transform to text (remove in final version)
  userComments1 = `Comments: ${userComments1}, Communication: ${userComments1 / avgCommunication}`;
  userComments2 = `Comments: ${userComments2}, Communication: ${userComments2 / avgCommunication}`;
  numComments = `Total comments: ${numComments}, Average comments: ${avgCommunication}`;

  userWatchedIssues1 = `Watches: ${userWatchedIssues1.issues.length}, Involvement: ${userWatchedIssues1.issues.length / avgInvolvement}`;
  userWatchedIssues2 = `Watches: ${userWatchedIssues2.issues.length}, Involvement: ${userWatchedIssues2.issues.length / avgInvolvement}`;
  numWatches = `Total watches: ${numWatches}, Average watches: ${avgInvolvement}`;

  const userPriority1 = `Priority: [${userLowest1}, ${userLow1}, ${userMedium1}, ${userHigh1}, ${userHighest1}]: ${userP1}, Technical: ${userP1 / avgPriority}`;
  const userPriority2 = `Priority: [${userLowest2}, ${userLow2}, ${userMedium2}, ${userHigh2}, ${userHighest2}]: ${userP2}, Technical: ${userP2 / avgPriority}`;
  const totalPriority = `Total Priority: ${numLowest}, ${numLow}, ${numMedium}, ${numHigh}, ${numHighest}, Average Priority: ${avgPriority}`;

  userClosed1 = `Closed issues: ${userClosed1}, On-time issues: ${userOnTime1}, Met Deadlines: ${userOnTime1 / userClosed1}, Deadlines: ${(userOnTime1 / userClosed1) / avgDeadlines}`;
  userClosed2 = `Closed issues: ${userClosed2}, On-time issues: ${userOnTime2}, Met Deadlines: ${userOnTime2 / userClosed2}, Deadlines: ${(userOnTime2 / userClosed2) / avgDeadlines}`;
  numClosed = `Total closed issues: ${numClosed}, Total on-time issues: ${numOnTime}, Average On-Time: ${avgDeadlines}`;

  userRecent1 = `Recently Closed: ${userRecent1}, Productivity: ${userRecent1 / avgProductivity}`;
  userRecent2 = `Recently Closed: ${userRecent2}, Productivity: ${userRecent2 / avgProductivity}`;
  numRecent = `Total Recent: ${numRecent}, Average Recent: ${avgProductivity}`;

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
                >` + `<g>` + circle + line + poly + poly2 + caption + `</g>` + `</svg>`;

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

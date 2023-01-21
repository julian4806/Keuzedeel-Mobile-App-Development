<?php
include "./db_conn.php";
$obj = new Connection();
$conn = $obj->connection();

// Checks if there's a GET request being made
if (isset($_GET['player']) && isset($_GET['score'])) {
    $player = $_GET['player'];
    $score = $_GET['score'];

    $my_date = date("Y-m-d H:i:s");

    // inserts into the player table... Name and Date
    $query = " INSERT INTO `player` (name , date) VALUES('$player', '$my_date') ";
    $result = mysqli_query($conn, $query);

    $player_id = $conn->insert_id;
    // also inserts into the score table
    $query = " INSERT INTO `score` (player_id, score, playdate) VALUES('$player_id', '$score', '$my_date') ";
    $result = mysqli_query($conn, $query);
}

// uses a join to combine the two tables together and limits the results to 5
$query = " SELECT player.name AS player, score.score AS score FROM player INNER JOIN score ON player.id = score.player_id ORDER BY score DESC LIMIT 5 ";
$result = mysqli_query($conn, $query);

?>
<!-- Just renders all the results to the webpage, so the JavaScript fetch can pull the data  -->
<?php
while ($row_users = mysqli_fetch_array($result)) {
    echo "<li>" . ($row_users['player']) . ": " . ($row_users['score']) . "</li>";
}

// closes the connection
$conn->close();
exit();
?>



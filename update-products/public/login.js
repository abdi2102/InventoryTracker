async function login() {
  try {
    console.log("gefdaj")
    const res = await axios.post("http://localhost:3000/login/google");

    if (res.data.authUrl) {
      window.location.href = res.data.authUrl;
    } else {
      window.location.href = "/user/spreadsheet";
    }
  } catch (error) {
    console.log(error)
    console.log("something went wrong. oops.");
  }
}

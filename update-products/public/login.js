// $(document).ready(function () {
//   $("#loginModal").modal("show");
//   $(function () {
//     $('[data-toggle="tooltip"]').tooltip();
//   });
// });

async function login() {
  try {
    const res = await axios.get("http://localhost:3000/login/google");
    window.location.href = res.data.authUrl;
  } catch (error) {
    console.log("something went wrong. oops.")
  }
}

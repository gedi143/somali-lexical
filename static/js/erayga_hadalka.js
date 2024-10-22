$(document).ready(function () {
  // Initial data fetch and select options population
  fetchEraygaHadalka(); // Fetch all records initially
  fetchSelectOptions(); // Populate select options

  // Search filter functionality
  $("#searchDerivative").on("keyup", function () {
    var searchText = $(this).val().toLowerCase();

    // Loop through all table rows and hide those that don't match the search query
    $("#eraygaTable tbody tr").filter(function () {
      $(this).toggle($(this).text().toLowerCase().indexOf(searchText) > -1);
    });
  });

  // Function to fetch all Erayga Hadalka records and populate the table
  function fetchEraygaHadalka(searchTerm = "") {
    $.ajax({
      url: "/readAllErayga", // Adjust your endpoint accordingly
      method: "GET",
      data: { search: searchTerm }, // Send search term as query parameter
      success: function (data) {
        let tbody = "";
        data.forEach(function (item, index) {
          tbody += `<tr>
                        <td>${index + 1}</td>
                        <td>${item.Asalka_erayga_name}</td>
                        <td>${item.Qeybta_hadalka_name}</td>
                        <td>${item.Erayga}</td>
                        <td>
                            <button class="btn btn-primary btn-md edit-item" data-id="${
                              item.Aqoonsiga_erayga
                            }"><i class="fa fa-edit"></i></button>
                            <button class="btn btn-danger btn-md delete-item" data-id="${
                              item.Aqoonsiga_erayga
                            }"><i class="fa fa-trash"></i></button>
                        </td>
                    </tr>`;
        });
        $("#eraygaTable tbody").html(tbody); // Update the table body
      },
      error: function (error) {
        console.error("Error fetching Erayga Hadalka:", error);
      },
    });
  }

  // Function to fetch select options for Qeybta Hadalka
  function fetchSelectOptions() {
    $.get("/readAll", function (data) {
      let options = '<option value="0">Choose Part of Speech</option>';
      data.forEach((item) => {
        options += `<option value="${item.Aqoonsiga_hadalka}">${item.Qaybta_hadalka} (${item.Loo_gaabsho})</option>`;
      });
      $("#Qeybta_hadalka, #editQeybta_hadalka").html(options);
    });
  }

  // Show the Add Modal when the add button is clicked
  $("#addNewErayga").click(function () {
    $("#addEraygaForm")[0].reset(); // Reset the form
    fetchAsalkaOptionsForUser(); // Fetch options specific to the current user
    $("#addEraygaModal").modal("show"); // Show the modal
  });

  // Function to fetch Asalka Erayga options for the current user
  function fetchAsalkaOptionsForUser() {
    $.get("/readAllAsalka", function (response) {
      let options = '<option value="0">Choose Root Words</option>';
      response.data.forEach((item) => {
        options += `<option value="${item.Aqonsiga_Erayga}">${item.Erayga_Asalka}</option>`;
      });
      $("#Asalka_erayga").html(options);
    }).fail(function (error) {
      console.error("Error fetching Asalka Erayga options:", error);
    });
  }

  // Handle form submission for adding new Erayga Hadalka
  $("#addEraygaForm").submit(function (event) {
    event.preventDefault();
    const formDataObject = {};
    var eraygaInput = $("#Erayga").val();
    var noocaErayga = $("#Nooca_erayga").val();
    var qeybtaHadalka = $("#Qeybta_hadalka").val();
    var asalkaErayga = $("#Asalka_erayga").val();

    // Validate form inputs
    if (eraygaInput.trim() === "") {
      Swal.fire("Error", "Erayga is required. Please enter a value.", "error");
      return;
    }
    if (noocaErayga === "0") {
      Swal.fire(
        "Error",
        "Nooca Erayga is required. Please select a valid option.",
        "error"
      );
      return;
    }
    if (qeybtaHadalka === "0") {
      Swal.fire(
        "Error",
        "Qeybta Hadalka is required. Please select a valid option.",
        "error"
      );
      return;
    }
    if (asalkaErayga === "0") {
      Swal.fire(
        "Error",
        "Asalka Erayga is required. Please select a valid option.",
        "error"
      );
      return;
    }

    // Split the Erayga input by comma or space to get multiple words
    let eraygaWords = eraygaInput
      .split(/[,\s]+/)
      .filter((word) => word.trim() !== "");

    if (eraygaWords.length === 0) {
      Swal.fire("Error", "Please enter valid words for Erayga.", "error");
      return;
    }

    // Prepare the form data for each word
    const requests = eraygaWords.map((word) => {
      const newWordData = {
        Erayga: word.trim(),
        Nooca_erayga: noocaErayga,
        Qeybta_hadalka: qeybtaHadalka,
        Asalka_erayga: asalkaErayga,
      };
      return $.ajax({
        url: "/createErayga",
        method: "POST",
        contentType: "application/json",
        data: JSON.stringify(newWordData),
      });
    });

    // Send all requests and handle the response
    Promise.all(requests)
      .then(function () {
        $("#addEraygaModal").modal("hide");
        fetchEraygaHadalka(); // Refresh the table
        Swal.fire(
          "Success",
          `${eraygaWords.length} words inserted successfully`,
          "success"
        );
      })
      .catch(function (xhr) {
        Swal.fire(
          "Error",
          xhr.responseJSON.error || "Failed to save Erayga Hadalka",
          "error"
        );
      });
  });

  // Show the Edit Modal with pre-filled data
  $(document).on("click", ".edit-item", function () {
    const itemId = $(this).data("id"); // The clicked word ID
    $.get(`/readInfoErayga/${itemId}`, function (data) {
      // Set the values of the fields
      $("#editAqoonsiga_erayga").val(data.erayga_data.Aqoonsiga_erayga); // Set the word's ID
      $("#editErayga").val(data.erayga_data.Erayga); // Set the word itself
      $("#editNooca_erayga").val(data.erayga_data.Nooca_erayga); // Set the word type (Nooca)
      $("#editQeybta_hadalka").val(data.erayga_data.Qeybta_hadalka); // Set part of speech

      // Populate the dropdown with all Asalka_erayga options
      let asalkaOptions = "";
      data.asalka_options.forEach(function (option) {
        asalkaOptions += `<option value="${option.Aqonsiga_Erayga}" ${
          option.Aqonsiga_Erayga == data.erayga_data.Asalka_erayga
            ? "selected"
            : ""
        }>${option.Erayga_Asalka}</option>`;
      });
      $("#editAsalka_erayga").html(asalkaOptions); // Insert all Asalka options, with the relevant one pre-selected

      // Show the modal after populating the dropdown
      $("#editEraygaModal").modal("show");
    }).fail(function (error) {
      console.error("Error fetching Erayga Hadalka details:", error);
    });
  });
  // Handle form submission for editing Erayga Hadalka
  $("#editEraygaForm").submit(function (event) {
    event.preventDefault();
    const itemId = $("#editAqoonsiga_erayga").val();
    const formDataObject = {};

    var noocaErayga = $("#editNooca_erayga").val();
    var qeybtaHadalka = $("#editQeybta_hadalka").val();
    var asalkaErayga = $("#editAsalka_erayga").val();

    // Validate form inputs
    if (noocaErayga === "0") {
      Swal.fire(
        "Error",
        "Nooca Erayga is required. Please select a valid option.",
        "error"
      );
      return;
    }
    if (qeybtaHadalka === "0") {
      Swal.fire(
        "Error",
        "Qeybta Hadalka is required. Please select a valid option.",
        "error"
      );
      return;
    }
    if (asalkaErayga === "0") {
      Swal.fire(
        "Error",
        "Asalka Erayga is required. Please select a valid option.",
        "error"
      );
      return;
    }

    // Serialize form data to JSON
    $(this)
      .serializeArray()
      .forEach((field) => {
        formDataObject[field.name] = field.value;
      });

    $.ajax({
      url: `/updateErayga/${itemId}`,
      method: "PUT",
      contentType: "application/json",
      data: JSON.stringify(formDataObject),
      success: function (data) {
        $("#editEraygaModal").modal("hide");
        fetchEraygaHadalka(); // Refresh the table
        Swal.fire("Success", data.message, "success");
      },
      error: function (xhr) {
        Swal.fire(
          "Error",
          xhr.responseJSON.error || "Failed to update Erayga Hadalka",
          "error"
        );
      },
    });
  });

  // Show the Edit Multiple Modal with pre-filled data
  $(document).ready(function () {
    // Call this function when the "Update Multiple" modal is shown
    $("#updateMultipleModal").on("show.bs.modal", function () {
      fetchPartOfSpeechOptions(); // Populate Part of Speech options
      fetchRootWordOptions(); // Populate Root Word options
    });

    // Function to populate Part of Speech options (used in both modals)
    function fetchPartOfSpeechOptions() {
      $.get("/readAll", function (data) {
        let options =
          '<option value="" disabled selected>Choose Part of Speech</option>';
        data.forEach((item) => {
          options += `<option value="${item.Aqoonsiga_hadalka}">${item.Qaybta_hadalka} (${item.Loo_gaabsho})</option>`;
        });
        // Populate both modals
        $("#editQeybta_hadalka, #updateQeybta_hadalka").html(options);
      }).fail(function (error) {
        console.error("Error fetching Part of Speech options:", error);
      });
    }

    // Function to populate Root Word options (used in both modals)
    function fetchRootWordOptions() {
      $.get("/readAllAsalka", function (response) {
        let options =
          '<option value="" disabled selected>Choose Root Word</option>';
        response.data.forEach((item) => {
          options += `<option value="${item.Aqonsiga_Erayga}">${item.Erayga_Asalka}</option>`;
        });
        // Populate both modals
        $("#editAsalka_erayga, #updateAsalka_erayga").html(options);

        // Add event listener for the root word selection in the "Update Multiple" modal
        $("#updateAsalka_erayga, #updateQeybta_hadalka").on(
          "change",
          function () {
            const rootWordId = $("#updateAsalka_erayga").val();
            const partOfSpeechId = $("#updateQeybta_hadalka").val();

            if (rootWordId !== "" && partOfSpeechId !== "") {
              fetchDerivativeWords(rootWordId, partOfSpeechId);
            } else {
              $("#derivativeWordsTextarea").val(""); // Clear if no root word or part of speech selected
            }
          }
        );
      }).fail(function (error) {
        console.error("Error fetching Root Word options:", error);
      });
    }

    // Function to fetch and populate derivative words based on the selected root word and part of speech
    function fetchDerivativeWords(rootWordId, partOfSpeechId) {
      $.get(
        `/getDerivativeWords/${rootWordId}/${partOfSpeechId}`,
        function (data) {
          let derivatives = data.map((item) => item.Erayga).join(", ");
          $("#derivativeWordsTextarea").val(derivatives); // Populate the textarea with derivative words
        }
      ).fail(function (error) {
        console.error("Error fetching derivative words:", error);
      });
    }
  });

  // Handle form submission for updating multiple derivative words
  $("#updateMultipleForm").submit(function (event) {
    event.preventDefault();

    const formDataObject = {};

    // Get values from the form
    const noocaErayga = $("#updateNooca_erayga").val();
    const qeybtaHadalka = $("#updateQeybta_hadalka").val();
    const asalkaErayga = $("#updateAsalka_erayga").val();
    const derivativeWords = $("#derivativeWordsTextarea").val();

    // Validate form inputs
    if (!noocaErayga) {
      Swal.fire(
        "Error",
        "Word Type is required. Please select a valid option.",
        "error"
      );
      return;
    }
    if (!qeybtaHadalka) {
      Swal.fire(
        "Error",
        "Part of Speech is required. Please select a valid option.",
        "error"
      );
      return;
    }
    if (!asalkaErayga) {
      Swal.fire(
        "Error",
        "Root Word is required. Please select a valid option.",
        "error"
      );
      return;
    }
    if (!derivativeWords.trim()) {
      Swal.fire(
        "Error",
        "Derivative Words are required. Please populate the textarea.",
        "error"
      );
      return;
    }

    // Serialize form data to JSON
    $(this)
      .serializeArray()
      .forEach((field) => {
        formDataObject[field.name] = field.value;
      });

    // Confirmation dialog before submitting
    Swal.fire({
      title: "Are you sure?",
      text: "This action may update one or more records. Please confirm to proceed.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, update it!",
      cancelButtonText: "No, cancel!",
    }).then((result) => {
      if (result.isConfirmed) {
        // AJAX request to update multiple derivative words
        $.ajax({
          url: `/updateMultiple`, // Change to the correct endpoint
          method: "PUT", // Use PUT or POST depending on your API
          contentType: "application/json",
          data: JSON.stringify(formDataObject),
          success: function (data) {
            // Close the modal on success
            $("#updateMultipleModal").modal("hide");

            // Optional: Refresh table or page
            fetchEraygaHadalka(); // Replace with appropriate function to refresh records

            // Display success message
            Swal.fire("Success", data.message, "success");

            // Clear form fields
            $("#updateMultipleForm")[0].reset(); // Reset the form fields to default
            $("#derivativeWordsTextarea").val(""); // Clear the textarea specifically
          },
          error: function (xhr) {
            // Handle error response
            Swal.fire(
              "Error",
              xhr.responseJSON.error || "Failed to update derivative words.",
              "error"
            );
          },
        });
      }
    });
  });

  // Handle deleting Erayga Hadalka
  $(document).on("click", ".delete-item", function () {
    const itemId = $(this).data("id");
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        $.ajax({
          url: `/deleteErayga/${itemId}`,
          method: "DELETE",
          success: function () {
            fetchEraygaHadalka(); // Refresh the table
            Swal.fire(
              "Deleted!",
              "Erayga Hadalka has been deleted.",
              "success"
            );
          },
          error: function (error) {
            Swal.fire("Error", "Failed to delete Erayga Hadalka", "error");
          },
        });
      }
    });
  });
});

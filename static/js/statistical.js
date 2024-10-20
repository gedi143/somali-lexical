$(document).ready(function () {
    // Fetch the statistical data and initialize charts
    fetchStatisticalData();

    // Function to fetch the statistical data and draw the chart and table
    function fetchStatisticalData() {
        $.get('/statistical_data', function (response) {
            // Populate the stats at the top
            $('#total_asalka_ereyada').text(response.total_asalka_ereyada || 0);
            $('#total_faraca_erayada').text(response.total_faraca_erayada || 0);
            $('#total_asalka_with_farac').text(response.total_asalka_with_farac || 0);
            $('#total_farac_with_asal').text(response.total_farac_with_asal || 0);
            $('#max_derivatives').text(response.max_derivatives || 0);
            $('#min_derivatives').text(response.min_derivatives || 0);

            // Prepare data for the Qaybta_hadalka distribution chart and table
            const labels = [];
            const countData = [];
            const percentageData = [];
            let tableRows = '';

            response.qaybta_hadalka_distribution.forEach(function (item) {
                labels.push(item.Qaybta_hadalka); // Part of Speech (Qaybta_hadalka)
                countData.push(item.derivative_count); // Number of Derivative Words
                percentageData.push(item.percentage.toFixed(2)); // Percentage

                // Populate table rows
                tableRows += `
                    <tr>
                        <td>${item.Qaybta_hadalka}</td>
                        <td>${item.derivative_count}</td>
                        <td>${item.percentage.toFixed(2)}%</td>
                    </tr>`;
            });

            // Insert the rows into the table body
            $('#qaybta_hadalka_distribution_table').html(tableRows);

            // Call the function to draw the improved histogram chart
            drawQaybtaHadalkaHistogram(labels, countData, percentageData);
        }).fail(function (xhr) {
            console.error('Error fetching statistical data:', xhr);
        });
    }

    // Function to draw the improved Qaybta_hadalka histogram chart
    function drawQaybtaHadalkaHistogram(labels, countData, percentageData) {
        const ctx = document.getElementById('qaybtaAsalkaChart').getContext('2d');
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels, // X-axis: Part of Speech (Qaybta_hadalka)
                datasets: [
                    {
                        label: 'Number of Derivative Words',
                        data: countData, // Y-axis: Count of Derivative Words
                        backgroundColor: 'rgba(54, 162, 235, 0.7)',
                        borderColor: 'rgba(54, 162, 235, 1)',
                        borderWidth: 2
                    },
                    {
                        label: 'Percentage (%)',
                        data: percentageData, // Percentage line
                        type: 'line',
                        fill: false,
                        borderColor: 'rgba(153, 102, 255, 1)',
                        backgroundColor: 'rgba(153, 102, 255, 0.5)',
                        yAxisID: 'percentageAxis'
                    }
                ]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top' // Position the legend at the top
                    },
                    datalabels: {
                        display: true, // Enable data labels on bars
                        align: 'top',
                        color: '#333',
                        font: {
                            weight: 'bold'
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Number of Derivative Words',
                            color: '#333',
                            font: {
                                size: 14,
                                weight: 'bold'
                            }
                        }
                    },
                    percentageAxis: {
                        position: 'right',
                        beginAtZero: true,
                        ticks: {
                            callback: function (value) {
                                return value + '%';  // Add percentage symbol to the axis
                            }
                        },
                        grid: {
                            drawOnChartArea: false  // Don't draw percentage grid lines on the chart area
                        },
                        title: {
                            display: true,
                            text: 'Percentage (%)',
                            color: '#333',
                            font: {
                                size: 14,
                                weight: 'bold'
                            }
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Part of Speech (Qaybta_hadalka)',
                            color: '#333',
                            font: {
                                size: 14,
                                weight: 'bold'
                            }
                        }
                    }
                }
            }
        });
    }
});

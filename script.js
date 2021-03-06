/*
 * Gallery website by Sarah Olson,
 * inspired by Schöttler, Sarah / based from template
 * of https://geonetworks.github.io.
 */

const url = "web_vis3.csv";

//used for the subject matter filters
const taxonomy = {
	conflict_theme: ["violence", "refugee", "tracking", "risk"],
	geographic_focus: [
		"Global",
		"Africa",
		"Middle_East",
		"Asia",
	],
	peace_theme: ["peacebuilding", "peace_agreements"],
	data_source: [
		"ACLED",
		"surveys",
		"PA-X",
		"UCDP",
	]
};

//used for the subject matter filters to display on the gallery as tags
const taxonomy_tags = {
	theme: ["Conflict Violence", "Refugee", "Conflict Tracking", "Conflict Risk",
					"Peacebuilding", "Peace Agreements"],
	affiliated_group: ["university", "government", "NGO", "private", "media"],
	geographic_focus: [
		"Global",
		"Africa",
		"Middle_East",
		"Asia"
	],
	visualization_library: ["Leaflet", "Tableau", "Microsoft Power BI", "CARTO", "ESRI"]
};
const tags_facets = Object.keys(taxonomy_tags);
const facets = Object.keys(taxonomy);

	// visualization features and data types (geospatial, temporal, etc.)
const datatypes = {
	// 3/ visualization features
	affiliated_group: ["university", "NGO", "private", "media", "government"],
	visualization_type: [
	"network",
	"temporal",
	"Geospatial",
	"dashboard",
	"storytelling",
	"customized"],
	accessibility: [
		"API",
		"updated",
		"save_image",
		"interactive",
		"data_available"
	]
};

const facets2 = Object.keys(datatypes);
const container = d3.select(".grid");

// add in mouseover help buttons

d3.select("#showall").on("click", function () {
d3.selectAll("input").property("checked", false);
	// dispatch event to reload techniques
	let event = new Event("change");
	eventHandler.dispatchEvent(event);
});

// create boxes to filter techniques (button attributes: interactivity)
var filters = d3
	.select("#filters")
	.selectAll("div")
	.data(facets)
	.enter()
	.append("div")
	.attr("id", (d) => "select_" + d);

filters
	.append("h3")
	.html((d) => formatText(d));

var checkboxes = filters
	.selectAll("input")
	.data((d) => taxonomy[d])
	.enter()
	.append("div")
	.classed("checkbox-container", true);
checkboxes
	.append("input")
	.attr("type", "checkbox")
	.attr("class", "input")
	.attr("id", function (d) {
		return (
			"check_" + d3.select(this.parentNode.parentNode).datum() + "_" + d
		);
	})
	.attr("value", (d) => d);
checkboxes
	.append("label")
	.attr("for", function (d) {
		return (
			"check_" + d3.select(this.parentNode.parentNode).datum() + "_" + d
		);
	})
	.append("span")
	.text((d) => formatText(d));

// bottom section: visible checkboxs with data types/visualization features
var dataFilters = d3
		.select("#filters_data")
		.selectAll("div")
		.data(facets2)
		.enter()
		.append("div")
		.attr("id", (d) => "select_" + d);

	dataFilters
		.append("h3")
		// .html(d => '<div class="legend_circle ' + d + '"></div>' + formatText(d));
		.html((d) => formatText(d));

// checkboxes for data features
var checkData = dataFilters
	.selectAll("input")
	.data((d) => datatypes[d])
	.enter()
	.append("div")
checkData
	.append("input")
	.attr("type", "checkbox")
	.attr("class", "input")
	.attr("id", function (d) {
		return (
			"check_" + d3.select(this.parentNode.parentNode).datum() + "_" + d
		);
	})
	.attr("value", (d) => d);
checkData
	.append("label")
	.attr("for", function (d) {
		return (
			"check_" + d3.select(this.parentNode.parentNode).datum() + "_" + d
		);
	})
	.append("span")
	.text((d) => sentenceCase(d));


d3.csv(url)
	.then(function (data) {
		// display total count of the visualizations count
		d3.selectAll("#count, #total").text(data.length);

		// listen for any changes in filters
		d3.selectAll(".input").on("change", function () {
			// get the filter values for the first part (subject matter)
			var filters = facets.map(function (facet) {
				var cats = [];
				taxonomy[facet].forEach(function (cat) {
					if (
						d3
							.select("#check_" + facet + "_" + cat)
							.property("checked")
					) {
						cats.push(cat);
					}
				});
				return [facet, cats];
			});
			//get filters for the check boxes (visualization features)
			var dataFilters = facets2.map(function (facet2) {
				var cats2 = [];
				datatypes[facet2].forEach(function (cat2) {
					if (
						d3
							.select("#check_" + facet2 + "_" + cat2)
							.property("checked")
					) {
						cats2.push(cat2);
					}
				});
				return [facet2, cats2];
			});
			// update
			refreshTechniques(filters, dataFilters);
		});

		function refreshTechniques(filters, dataFilters) {
			// filter (get the filtered data)
			var fData = data.filter((d) => filterData(d, filters, dataFilters));
			// update count in heading
			d3.select("#count").text(fData.length);
			// get the IDs of associated techniques
			var ids = fData.map((d) => d.image);
			// hide all non-matching ones
			d3.selectAll(".grid-item").style("display", (d) =>
				ids.indexOf(d.image) != -1 ? null : "none"
			);
			// update the layout
			msnry.layout();
		}

		// draw boxes for the visualizations
		var div = container
			.selectAll("div")
			.data(data)
			.enter()
			.append("div")
			.classed("grid-item", true);

		div.append("img").attr("src", (d) => "img/" + d.image + ".png");
		div.append("h2").text((d) => d.Title);
		div.append("span").html((d) =>
			[
				d.Author,
				" <i>",
				"</i>",
				" <a href=" + d.URL + ' target="_blank">[Link]</a>',
				"<br>",
			].join("")
		);
		var tags = div.append("div").style("margin-top", "7px");

		// add tags on technique cards
		tags_facets.forEach(function (facet) {
			tags.append("div")
				.classed("tag", true)
				.classed(facet, true)
				.html((d) => d[facet]);
		});
	})
	.then(function () {
		imagesLoaded(".grid", function () {
			var elem = document.querySelector(".grid");
			window.msnry = new Masonry(elem, {
				// options
				itemSelector: ".grid-item",
				columnWidth: 241,
				gutter: 15,
			});
		});
	})
	.catch(function (error) {
		throw error;
	});

function filterData(d, filters, dataFilters) {
	return (
		filters.every(function (fil) {
			// facet: fil[0]
			// selected: fil[1]
			// check if either array is empty or category is selected
			return fil[1].length == 0 || fil[1].indexOf(d[fil[0]]) != -1;
		}) &&
		dataFilters.every(function (fil2) {
			// facet: fil[0]
			// selected: fil[1]

			// d[fil2[1]] --> data ['network'] == yes
			if (fil2[1].length == 2){
				 return d[fil2[1][0]] == "yes" && d[fil2[1][1]] == "yes"
			}
			if (fil2[1].length == 3){
				 return d[fil2[1][0]] == "yes" && d[fil2[1][1]] == "yes" && d[fil2[1][2]] == "yes"
			}
			if (fil2[1].length == 4){
				 return d[fil2[1][0]] == "yes" && d[fil2[1][1]] == "yes" && d[fil2[1][2]] == "yes" && d[fil2[1][3]] == "yes"
			}
			return fil2[1].length == 0 || d[fil2[1]] == "yes";
		})
		//dataFilters.every(function (fil) {
		//	return d[fil] == "yes";
		//})
	);
}

function sentenceCase(str) {
	// capitalise first word and replace underscores by spaces
	// replace first letter
	str = str.slice(0, 1).toUpperCase() + str.slice(1);
	// find all underscores, replace by spaces and capitalise following letter
	while (str.indexOf("_") != -1) {
		str =
			str.slice(0, str.indexOf("_")) +
			" " +
			str.slice(str.indexOf("_") + 1);
	}
	return str;
}


function formatText(str) {
	// capitalise and replace underscores by spaces
	// replace first letter
	str = str.slice(0, 1).toUpperCase() + str.slice(1);
	// find all underscores, replace by spaces and capitalise following letter
	while (str.indexOf("_") != -1) {
		str =
			str.slice(0, str.indexOf("_")) +
			" " +
			str
				.slice(str.indexOf("_") + 1, str.indexOf("_") + 2)
				.toUpperCase() +
			str.slice(str.indexOf("_") + 2);
	}
	return str;
}


function unique(arr, acc) {
	return arr.map(acc).filter(function (value, index, self) {
		return self.indexOf(value) === index;
	});
}

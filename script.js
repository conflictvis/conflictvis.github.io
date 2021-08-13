const url = "web_vis3.csv";

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

const datatypes = {
	// 3/ visualization features
	affiliated_group: ["university", "NGO", "private", "media", "government"],
	accessibility: [
		"data_publicly_available",
		"API",
		"actively_updated",
		"downloadable_image",
		"highly_interactive"
	],
	visualization_type: [
	"network",
	"temporal",
	"dashboard",
	"storytelling",
	"customized",
	"Geovisualization"],
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
	// .html(d => '<div class="legend_circle ' + d + '"></div>' + formatText(d));
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

//checkbox portion
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
		console.log(data);

		// display count
		d3.selectAll("#count, #total").text(data.length);

		// listen for changes in filters
		d3.selectAll(".input").on("change", function () {
			// get filter values for the boxes
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
			//get filters for the check boxes
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
			// filter
			var fData = data.filter((d) => filterData(d, filters, dataFilters));
			// update count in heading
			d3.select("#count").text(fData.length);
			// get IDs of techniques matching filter
			var ids = fData.map((d) => d.image);
			// hide all non-matching ones
			d3.selectAll(".grid-item").style("display", (d) =>
				ids.indexOf(d.image) != -1 ? null : "none"
			);
			// update layout
			msnry.layout();
		}

		// draw boxes for papers
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
			console.log(fil2[1])
			return fil2[1].length == 0 || d[fil2[1]] == "yes";
		})
		//dataFilters.every(function (fil) {
		//	return d[fil] == "yes";
		//})
	);
}

function unique(arr, acc) {
	return arr.map(acc).filter(function (value, index, self) {
		return self.indexOf(value) === index;
	});
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

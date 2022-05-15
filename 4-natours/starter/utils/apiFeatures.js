class APIFeatures {
  constructor(query, queryString) {
    // this.model = model;
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const queryFilter = {};

    this.query.schema.eachPath((path) => {
      if (path in this.queryString) {
        queryFilter[path] = this.queryString[path];
      }
    });

    // ADVANCED FILTERING

    let filterStr = JSON.stringify(queryFilter);
    filterStr = filterStr.replace(/\b(gte|gt|lt|lte)\b/g, (m) => `$${m}`);

    this.query = this.query.find(JSON.parse(filterStr));

    return this;
  }

  sort() {
    if (this.queryString.sort) {
      // const sortBy = req.query.sort.replace(/,/g, ' ');
      const sortBy = this.queryString.sort.split(',').join(' ');

      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createAt');
    }
    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.replace(/,/g, ' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }

    return this;
  }

  pagination() {
    const page = +(this.queryString.page || 1);
    const limit = +(this.queryString.limit || 10);
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}

module.exports = APIFeatures;

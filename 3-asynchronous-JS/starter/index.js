const fs = require('fs');
const superagent = require('superagent');

const readFilePro = (file) => {
  return new Promise((resolve, reject) => {
    fs.readFile(file, (err, data) => {
      if (err) reject(`File not found: ${file}`);
      resolve(data);
    });
  });
};

const writeFilePro = (file, data) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(file, data, (err) => {
      if (err) reject(`Could write a file: ${file}`);
      resolve('success');
    });
  });
};

const getDogPic = async (file) => {
  try {
    const data = await readFilePro(file);
    console.log(`Buffer: ${data}`);
    // const res = await superagent.get(
    //   `https://dog.ceo/api/breed/${data}/images/random`
    // );

    const resPro1 = superagent.get(
      `https://dog.ceo/api/breed/${data}/images/random`
    );
    const resPro2 = superagent.get(
      `https://dog.ceo/api/breed/${data}/images/random`
    );
    const resPro3 = superagent.get(
      `https://dog.ceo/api/breed/${data}/images/random`
    );

    const all = await Promise.all([resPro1, resPro2, resPro3]);
    const imgs = all.map((el) => el.body.message);
    console.log(imgs);

    await writeFilePro(`dog-img.txt`, imgs.join('\n'));
    // await writeFilePro(`dog-img.txt`, res.body.message);
    console.log('Image saved');
  } catch (err) {
    console.error(err);
    throw err;
  }

  return '2: Done with pic';
};

(async () => {
  try {
    console.log('1: Will get dog picture');
    const x = await getDogPic(`${__dirname}/dog.txt`);
    console.log(x);
    console.log('3: Done getting dog pics');
  } catch (err) {
    console.log('Error');
  }
})();

/*
console.log('1: Will get dog picture');
getDogPic(`${__dirname}/dog.txt`)
  .then((x) => {
    console.log(x);
    console.log('3: Done getting dog pics');
  })
  .catch(() => console.log('Error'));
  */

/*
readFilePro(`${__dirname}/dog.txt`)
  .then((data) => {
    console.log(`Buffer: ${data}`);
    return superagent.get(`https://dog.ceo/api/breed/${data}/images/random`);
  })
  .then((res) => {
    return writeFilePro(`dog-img.txt`, res.body.message)
    // fs.writeFile(`dog-img.txt`, res.body.message, () =>
    //   console.log('Image saved')
    // );
  }).then(() => console.log('Image saved'))
  .catch((err) => console.log(err));
  */

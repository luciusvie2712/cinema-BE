const Movie = require('../models/Movie')
const User = require('../models/User')

const determineStatus = (releaseDate, endDate) => {
    const today = Date.now();

    const releaseTime = new Date(releaseDate).getTime();
    const endTime = endDate ? new Date(endDate).getTime() : null;

    if (isNaN(releaseTime)) throw new Error("Ngày phát hành không hợp lệ");
    if (endTime && isNaN(endTime)) throw new Error("Ngày kết thúc không hợp lệ");

    if (releaseTime > today) return 'coming';
    if (endTime && endTime < today) return 'ended';
    return 'showing';
};


const getAllMovies = async (req, res) => {
    try {
        const movies = await Movie.find()
        const updateMovies = movies.map(movie => {
            const status = determineStatus(movie.releaseDate, movie.endDate)
            return {...movie.toObject(), status}
        })
        return res.status(200).json(updateMovies)
    } catch (error) {
        return res.status(500).json({ message: 'Loi may chu'})
    }
}

const getShowingMovies = async (req, res) => {
    try {
        const today = new Date()
        const movies = await Movie.find({
            releaseDate: {$lte: today}, 
            $or: [{ endDate: {$gte: today} }, { endDate: {$exists: false} }]
        })
        return res.status(200).json(movies.map(movie => ({
            ...movie.toObject(), status: 'showing'
        })))
    } catch (error) {
        return res.status(500).json({ message: 'Loi may chu'})
    }
}

const getComingMovies = async (req, res) => {
    try {
        const today = new Date()
        const movies = await Movie.find({
            releaseDate: {$gt: today}
        })
        res.status(200).json(movies.map(movie => ({
            ...movie.toObject(), status: 'coming'
        })))
    } catch (error) {
        return res.status(500).json({ message: 'Loi may chu'})
    }
}

const searchMovies = async (req, res) => {
    const { q, genre, status } = req.query;
  
    try {
      const query = {};
      if (q) {
        query.$or = [
          { title: { $regex: q, $options: 'i' } },
          { genres: { $elemMatch: { $regex: q, $options: 'i' } } }
        ];
      }
      if (genre) {
        query.genres = { $in: [genre] }; // genres là mảng nên dùng $in
      }
  
      const movies = await Movie.find(query);
  
      const today = new Date();
      const result = movies.map(movie => {
        const statusResult = determineStatus(movie.releaseDate, movie.endDate);
  
        if (status && status !== statusResult) {
          return null;
        }
        return { ...movie.toObject(), status: statusResult };
      }).filter(movie => movie !== null);
  
      return res.status(200).json(result);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Lỗi tìm kiếm phim' });
    }
};

const createMovie = async (req, res) => {
    try {
        const { title, genre, description, posterUrl, bannerUrl, releaseDate, endDate } = req.body;

        const parsedReleaseDate = new Date(releaseDate);
        const parsedEndDate = endDate ? new Date(endDate) : null;

        const status = determineStatus(parsedReleaseDate, parsedEndDate);

        const newMovie = new Movie({
            title,
            genre,
            description,
            posterUrl,
            bannerUrl,
            releaseDate: parsedReleaseDate,
            endDate: parsedEndDate,
            status,
        });

        await newMovie.save();
        return res.status(201).json({ message: 'Thêm phim thành công', movie: newMovie });
    } catch (error) {
        console.error('Lỗi thêm phim:', error.message);
        if (!res.headersSent) {
            return res.status(500).json({ message: 'Lỗi thêm phim', error: error.message });
        }
    }
};



const updateMovie = async (req, res) => {
    try {
        const { id } = req.params
        const {
            title, genre, description, posterUrl, bannerUrl, releaseDate, endDate
        } = req.body

        const movie = await Movie.findById(id)
        if (!movie)
            return res.status(404).json({ message: 'Khong tim thay phim'})

        movie.title = title || movie.title
        movie.genre = genre || movie.genre
        movie.description = description || movie.description
        movie.posterUrl = posterUrl || movie.posterUrl
        movie.bannerUrl = bannerUrl || movie.bannerUrl
        movie.releaseDate = releaseDate ? new Date(releaseDate) : movie.releaseDate
        movie.endDate = endDate ? new Date(endDate) : movie.endDate
        movie.status = determineStatus(releaseDate, endDate)

        await movie.save()
        return res.status(200).json({ message: "Cap nhat thanh cong", movie})
    } catch (error) {
        if (!res.headersSent) {
            return res.status(500).json({ message: 'Lỗi cập nhật phim', error: error.message });
        }
    }
}

const deleteMovie = async (req, res) => {
    try {
        const { id } = req.params
        const movie = await Movie.findByIdAndDelete(id)
        if (!movie) {
            return res.status(404).json({ message: 'Phim không tồn tại' });
        }
        return res.status(200).json({ message: 'Xoa phim thanh cong'})
    } catch (error) {
        return res.status(500).json({ message: 'Loi xoa phim'})
    }
}

const addComment = async (req, res) => {
    try {
        const { id } = req.params
        const { rating, text } = req.body
        const userId = req.user.id

        const movie = await Movie.findById(id)
        if (!movie)
            return res.status(404).json({ message: 'Khong tim thay phim'})

        const user = await User.findById(userId)
        const comment = {
            user: userId,
            username: user.fullName || 'Nguoi dung',
            text,
            rating
        }

        movie.comments.push(comment)
        movie.totalRating += rating
        movie.ratingCount += 1
        movie.avgRating = (movie.totalRating / movie.ratingCount).toFixed(1)

        await movie.save()
        return res.status(200).json({ message: 'Da them danh gia', movie})
    } catch (error) {
        return res.status(500).json({ message: 'Loi them danh gia'})
    }
}
const getMovieById = async (req, res) => {
    try {
      const movie = await Movie.findById(req.params.id)
        .populate('comments.user', 'username avatar') // nếu mày muốn lấy thêm info user
        .exec();
  
      if (!movie) {
        return res.status(404).json({ message: 'Không tìm thấy phim' });
      }
  
      return res.status(200).json(movie);
    } catch (error) {
      console.error('Lỗi khi lấy phim:', error);
      return res.status(500).json({ message: 'Đã xảy ra lỗi server' });
    }
  };

module.exports = { getAllMovies, getShowingMovies, getComingMovies, searchMovies, createMovie, updateMovie, deleteMovie, addComment, getMovieById }


var SMB2Forge = require('../tools/smb2-forge')
  , SMB2Request = SMB2Forge.request
  ;

var FileTime = require('win32filetime');

/*
 * readdir
 * =======
 *
 * list the file / directory from the path provided:
 *
 *  - open the directory
 *
 *  - query directory content
 *
 *  - close the directory
 *
 */
module.exports = function(path, cb){
  var connection = this;

  // SMB2 open directory
  SMB2Request('open', {path:path}, connection, function(err, file){
    if(err) cb && cb(err);
    // SMB2 query directory
    else SMB2Request('query_directory', file, connection, function(err, files){
      if(err) cb && cb(err);
      // SMB2 close directory
      else SMB2Request('close', file, connection, function(err){
        cb && cb(
          null
        , files
            .map(function(v) {
				function toUnixTimestamp(date) {
					return Math.floor(date / 1000)
				}

				function convertWinTime(buffer) {
	               	var low = buffer.readUInt32LE(0);
	               	var high = buffer.readUInt32LE(4);
	               	return toUnixTimestamp(FileTime.toDate({low: low, high: high}));
				}

				return {
					Filename: v.Filename,
					CreationTime: convertWinTime(v.CreationTime),
					LastAccessTime: convertWinTime(v.LastAccessTime),
					LastWriteTime: convertWinTime(v.LastWriteTime),
					ChangeTime: convertWinTime(v.ChangeTime),
					Attributes: v.FileAttributes
				}
			}) // return everything
            .filter(function(v){ return v.Filename!='.' && v.Filename!='..' }) // remove '.' and '..' values
        );
      });
    });
  });

}

export const parseFileName = (fileName) => {
  let semester = 'Unknown';
  let courseCode = 'Unknown';

  if (fileName && fileName.length >= 11) {
    courseCode = fileName.substring(0, 6);
    semester = fileName.substring(7, 11);
  }

  return { semester, courseCode };
};

export const parsePath = (path) => {
  let semester = 'Unknown';
  let courseCode = 'Unknown';

  const pathParts = path.split('/');
  for (const part of pathParts) {
    if (part.match(/^(SP|SU|FA|WI)\d{2}$/)) {
      semester = part;
    } else if (part.match(/^[A-Z]{3}\d{3}$/)) {
      courseCode = part;
    }
  }

  return { semester, courseCode };
};

export const parseStudentInfo = (path) => {
  let studentId = 'Unknown';
  let studentName = 'Unknown Student';

  const pathParts = path.split('/');
  for (const part of pathParts) {
    if (part.match(/SE\d{6}/) || part.match(/[A-Z]{2,}\d{6}/)) {
      studentId = part;
      break;
    }
  }

  for (const part of pathParts) {
    if (part.includes('_') && part.length > 5) {
      const nameParts = part.split('_');
      if (nameParts.length >= 2) {
        studentName = nameParts.slice(0, -1).join(' ');
        break;
      }
    }
  }

  return { studentId, studentName };
};


export const groupFilesBySemesterAndCourse = (files) => {
  const groups = {};
  files.forEach(file => {
    const semester = file.semester || 'Unknown';
    const courseCode = file.courseCode || 'Unknown';
    const key = `${semester}/${courseCode}`;

    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(file);
  });
  return groups;
};

export const processZipFile = async (zipFile) => {
  const JSZip = (await import('jszip')).default;
  const zip = await JSZip.loadAsync(zipFile);
  const files = [];

  zip.forEach((relativePath, zipEntry) => {
    if (!zipEntry.dir) {
      const fileName = relativePath.split('/').pop() || relativePath;
      const { semester, courseCode } = parseFileName(fileName);

      files.push({
        name: relativePath,
        size: zipEntry._data?.uncompressedSize || 0,
        compressedSize: zipEntry._data?.compressedSize || 0,
        semester: semester,
        courseCode: courseCode,
        originalFileName: fileName
      });
    }
  });

  files.sort((a, b) => {
    if (a.semester !== b.semester) {
      return a.semester.localeCompare(b.semester);
    }
    return a.courseCode.localeCompare(b.courseCode);
  });

  return files;
};

export const createExtractedFiles = async (originalZip, allFiles) => {
  const extractedFiles = [];

  for (const fileObj of allFiles) {
    const fileContent = await fileObj.entry.async('blob');
    const fileName = fileObj.path.split('/').pop();
    const fileSize = fileObj.entry._data?.uncompressedSize || 0;
    const fileType = fileName.split('.').pop().toLowerCase();
    
    const { semester, courseCode } = parsePath(fileObj.path);

    const path = `${semester}/${courseCode}`;
    extractedFiles.push({
      name: `${path}/${fileName}`,
      content: fileContent,
      size: fileSize,
      type: fileType
    });
  }

  return extractedFiles;
};

export const createSubmissionsFromZip = (zipContents) => {
  return zipContents.map((file, index) => {
    const pathParts = file.name.split('/');
    const { studentId, studentName } = parseStudentInfo(file.name);

    return {
      id: `imported_${Date.now()}_${index}`,
      studentName: studentName,
      studentId: studentId,
      fileName: file.originalFileName,
      submissionDate: new Date().toISOString(),
      status: 'submitted',
      grade: null,
      semester: file.semester,
      courseCode: file.courseCode,
      files: [`${file.semester}/${file.courseCode}/${file.originalFileName}`]
    };
  });
};


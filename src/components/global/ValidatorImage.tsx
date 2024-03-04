import {
  Image
 } from '@chakra-ui/react';

 interface ValidatorImageProps {
  url: string;
  size?: string;
}
 export const ValidatorImage: React.FC<ValidatorImageProps> = ({ url, size='30px' }) => {

 let defaultUrl = 'https://dao.rei.network/img/rei.538a10e1.svg'

  let _url:any = url ? `https://ipfs.rei.network/ipfs/${url}`: defaultUrl

  return (
    <Image
      borderRadius='full'
      boxSize={size}
      src={_url}
      alt=''
    />
  )
}
